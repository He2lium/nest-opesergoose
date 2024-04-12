import { Injectable } from '@nestjs/common'
import { Client } from '@opensearch-project/opensearch'
import { OpeserOptions } from './types/opeser-module-options.type'
import { OpeserMappingStorage } from './storage/opeser-mapping.storage'
import {
  AggregationsAggregate,
  IndicesIndexSettings,
  SearchHit,
  SearchRequest
} from '@opensearch-project/opensearch/api/types'
import { OpeserDocumentType } from './types/opeser-document.type'
import {OpeserSearchResponseType} from "./types/opeser-search-response.type";
import {OmitByMapUtil} from "./utils/omit-by-map.util";
import {OpeserStorageType} from "./types/opeser-storage.type";
@Injectable()
export class OpeserService extends Client {
  private readonly schemas: {
    [index: string]: OpeserStorageType.schema
  } = {}

  private readonly indexSettings: { [index: string]: IndicesIndexSettings } = {}
  private readonly indexPrefix: string

  constructor(options: OpeserOptions) {
    super(options)
    this.indexPrefix = options.prefix
    for (const schema of OpeserMappingStorage.schemas) {
      if (!schema.index) continue
      this.schemas[schema.index] = schema

      if (schema.settings) this.indexSettings[schema.index] = schema.settings
    }
  }

  private getIndexWithPrefix(index: string) {
    return `${this.indexPrefix}${index}`
  }

  private prepare(index: string, document: OpeserDocumentType) {
    const {map, transform} = this.schemas[index]
    return OmitByMapUtil(map, !!transform?transform(document):document)
  }

  async OgMap(settingsMap?:Map<string, IndicesIndexSettings>) {
    let recreatedIndexAliases: string[] = []
    for (const index in this.schemas) {
      if (await this._OgMapIndex(index, settingsMap.get(index))) recreatedIndexAliases.push(index)
    }
    return recreatedIndexAliases
  }

  private async _OgMapIndex(index: string, customSettings?: IndicesIndexSettings): Promise<boolean> {
    let recreatedFlag = false
    const properties = this.schemas[index].map
    const indexWithPrefix = this.getIndexWithPrefix(index)
    const settings = customSettings ?? this.indexSettings[index]

    const { body: foundIndexes } = await this.indices.get({
      index: `${indexWithPrefix}_*`,
    })

    const createdIndexName = `${indexWithPrefix}_${Date.now()}`

    if (Object.keys(foundIndexes).length) {
      for (const foundIndex in foundIndexes) {
        try {
          // check that the new mapping does not conflict with the previous one
          await this.indices.putMapping({ index: foundIndex, body: { properties } })

          if (settings && Object.keys(settings).length) {
            await this.indices.close({ index: foundIndex })

            try {
              await this.indices.putSettings({
                index: foundIndex,
                body: { settings },
              })
            } catch (error) {
              // no settings to update
              // console.info(error)
            }

            await this.indices.open({ index: foundIndex })
          }

          console.info(`successful ${foundIndex} index re-mapping`)
        } catch (e) {
          recreatedFlag = true
          // If there is a conflict in mapping, create a new index
          await this.indices.create({
            index: createdIndexName,
            body: {
              aliases: foundIndexes[foundIndex].aliases,
              mappings: { properties },
              settings,
            },
          })

          await this.indices.delete({ index: foundIndex })

          console.info(`index [${foundIndex}] was deleted. A new index [${createdIndexName}] was created`)
        }
      }
    } else {
      recreatedFlag = true
      await this.indices.create({
        index: createdIndexName,
        body: {
          aliases: { [indexWithPrefix]: {} },
          mappings: { properties },
          settings: this.indexSettings[index],
        },
      })

      console.info(`a new index [${createdIndexName}] was created`)
    }
    return recreatedFlag
  }

  async OgIndex(index: string, document: OpeserDocumentType, refresh: boolean = true) {
    return this.index({
      index: this.getIndexWithPrefix(index),
      id: document.id,
      body: this.prepare(index, document),
      refresh,
    })
  }

  async OgBulk(
      index: string,
      documents: {
        index?: OpeserDocumentType[],
        delete?: string[]
      }
  ) {
    let indexBody = []
    if (documents.index?.length){
      indexBody = documents.index.flatMap((document) =>
          ([{ index: { _index: this.getIndexWithPrefix(index), _id: document.id } }, this.prepare(index, document)])
      )
    }

    let deleteBody = []
    if(documents.delete?.length){
      deleteBody = documents.delete.map((id) =>
          ({ delete: { _index: this.getIndexWithPrefix(index), _id: id } })
      )
    }

    return this.bulk({ body: [...indexBody, ...deleteBody] })
  }

  async OgDelete(index: string, id: string, refresh: boolean = true) {
    return this.delete({
      index: this.getIndexWithPrefix(index),
      id,
      refresh,
    })
  }

  async OgSearch<ResponseType = any, AggregationsType = AggregationsAggregate>(index: string, body: SearchRequest['body']){
    return this.search<OpeserSearchResponseType<ResponseType,AggregationsType>>({
      index: this.getIndexWithPrefix(index),
      body
    })
  }

  async OgGet<ResponseType = any>(index: string, id: string){
    return this.get<SearchHit<ResponseType>>({
      index: this.getIndexWithPrefix(index),
      id
    })
  }
}
