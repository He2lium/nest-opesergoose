import { Injectable } from '@nestjs/common'
import { Client } from '@opensearch-project/opensearch'
import { OpeserOptions } from './types/opeser-module-options.type'
import { OpeserMappingStorage } from './storage/opeser-mapping.storage'
import { IndicesIndexSettings, MappingProperty } from '@opensearch-project/opensearch/api/types'
import omitDeep from 'omit-deep'

@Injectable()
export class OpeserService extends Client {
  private readonly forbiddenFields: { [index: string]: string[] } = {}
  private readonly schemaMapping: {
    [index: string]: Record<string, MappingProperty>
  } = {}
  private readonly indexSettings: { [index: string]: IndicesIndexSettings } = {}
  private readonly indexPrefix: string

  constructor(options: OpeserOptions) {
    super(options)
    this.indexPrefix = `${process.env['OPENSEARCH_INDEX_PREFIX'] || ''}`
    for (const schema of OpeserMappingStorage.schemas) {
      if (!schema.index) continue
      this.schemaMapping[schema.index] = schema.map

      if (schema.forbiddenFields) this.forbiddenFields[schema.index] = schema.forbiddenFields
      if (schema.settings) this.indexSettings[schema.index] = schema.settings
    }
  }

  private getIndexWithPrefix(index: string) {
    return `${this.indexPrefix}${index}`
  }

  private omit(index: string, document: any) {
    const forbiddenFields = this.forbiddenFields[index] ?? []
    return omitDeep(document, [...new Set([...forbiddenFields, 'id', '_id', '__v'])])
  }

  async OgMap(afterCreateIndex: { [index: string]: () => any } = {}) {
    for (const index in this.schemaMapping) await this._OgMapIndex(index, afterCreateIndex[index])
  }

  private async _OgMapIndex(index: string, cb?: () => any) {
    const properties = this.schemaMapping[index]
    const indexWithPrefix = this.getIndexWithPrefix(index)
    const settings = this.indexSettings[index]

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
          // If there is a conflict in mapping, create a new index
          await this.indices.create({
            index: createdIndexName,
            body: {
              aliases: foundIndexes[foundIndex].aliases,
              mappings: { properties },
              settings,
            },
          })

          if (cb) await cb()

          await this.indices.delete({ index: foundIndex })

          console.info(`index [${foundIndex}] was deleted. A new index [${createdIndexName}] was created`)
        }
      }
    } else {
      await this.indices.create({
        index: createdIndexName,
        body: {
          aliases: { [indexWithPrefix]: {} },
          mappings: { properties },
          settings: this.indexSettings[index],
        },
      })

      if (cb) await cb()

      console.info(`a new index [${createdIndexName}] was created`)
    }
  }

  async OgIndex(index: string, document: any, refresh: boolean = true) {
    return this.index({
      index: this.getIndexWithPrefix(index),
      id: document._id.toString(),
      body: this.omit(index, document),
      refresh,
    })
  }

  async OgBulk(index: string, documents: any[]) {
    if (!documents.length) return

    const body = documents.flatMap((document) => {
      return [
        { index: { _index: this.getIndexWithPrefix(index), _id: document._id.toString() } },
        this.omit(index, document),
      ]
    })
    await this.bulk({ body })
  }

  async OgDelete(index: string, id: string, refresh: boolean = true) {
    return this.delete({
      index: this.getIndexWithPrefix(index),
      id,
      refresh,
    })
  }
}
