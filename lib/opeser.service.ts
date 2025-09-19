import { Injectable } from '@nestjs/common'
import { Client } from '@opensearch-project/opensearch'
import type { OpeserOptions } from './types/opeser-module-options.type'
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
import { Bulk, DeleteByQuery } from "@opensearch-project/opensearch/api/requestParams"

@Injectable()
export class OpeserService extends Client {
  private readonly schemas: {
    [index: string]: OpeserStorageType.schema
  } = {}

  private readonly _indexSettings: { [index: string]: IndicesIndexSettings } = {}
  private readonly _indexPrefix: string

  constructor(options: OpeserOptions) {
    super(options)
    this._indexPrefix = options.prefix || ""
    for (const schema of OpeserMappingStorage.schemas) {
      if (!schema.index) continue
      this.schemas[schema.index] = schema

      if (schema.settings) this._indexSettings[schema.index] = schema.settings
    }
  }

  private _getIndexWithPrefix(index: string) {
    return `${this._indexPrefix}${index}`
  }

  private _prepare(index: string, document: OpeserDocumentType) {
    const {map} = this.schemas[index]
    return OmitByMapUtil(map, document)
  }

  /**
   * Recreate all indexes without data
   * @param settingsMap
   */
  async ogRecreateIndexes(settingsMap?:Map<string, IndicesIndexSettings>) {
    for (const index in this.schemas) {
      await this.ogRecreateIndex(index, settingsMap?.get(index))
    }
  }

  /**
   * Recreate index without data
   * @param index
   * @param customSettings
   */
  async ogRecreateIndex(index: string, customSettings?: IndicesIndexSettings) {
    const properties = this.schemas[index].map
    const indexWithPrefix = this._getIndexWithPrefix(index)
    const settings = customSettings ?? this._indexSettings[index]

    const {body: exists} = await this.indices.exists({index: indexWithPrefix})

    if(exists){
      await this.indices.delete({ index: indexWithPrefix })
    }

    await this.indices.create({
      index: indexWithPrefix,
      body: {
        mappings: { properties },
        settings: settings,
      },
    })
  }

  /**
   * Update all indexes, only exists
   * @param settingsMap
   */
  async ogUpdateIndexes(settingsMap?:Map<string, IndicesIndexSettings>){
    for (const index in this.schemas) {
      await this.ogUpdateIndex(index, settingsMap?.get(index))
    }
  }

  /**
   * Update one index if only it exists
   * @param index
   * @param customSettings
   */
  async ogUpdateIndex(index: string, customSettings?: IndicesIndexSettings){
    const indexWithPrefix = this._getIndexWithPrefix(index)
    const {body: exists} = await this.indices.exists({index: indexWithPrefix})
    const settings = customSettings ?? this._indexSettings[index]
    if(exists){
      const properties = this.schemas[index].map
      await this.indices.putMapping({ index: indexWithPrefix, body: {properties}})
      await this.indices.putSettings({ index: indexWithPrefix, body: {settings}})
    }
  }

  /**
   * Store document with special id
   * @param index
   * @param document
   * @param refresh
   */
  async ogSave(index: string, document: OpeserDocumentType, refresh: boolean = true) {
    return this.index({
      index: this._getIndexWithPrefix(index),
      id: document.id,
      body: this._prepare(index, document),
      refresh,
    })
  }

  /**
   * Bulk write operation
   * @param index
   * @param documents
   * @constructor
   */
  async ogBulk(
      index: string,
      documents: {
        index?: OpeserDocumentType[],
        delete?: string[]
      }
  ) {
    let indexBody:Bulk = []
    if (documents.index?.length){
      indexBody = documents.index.flatMap((document) =>
          ([{ index: { _index: this._getIndexWithPrefix(index), _id: document.id } }, this._prepare(index, document)])
      )
    }

    let deleteBody:Bulk = []
    if(documents.delete?.length){
      deleteBody = documents.delete.map((id) =>
          ({ delete: { _index: this._getIndexWithPrefix(index), _id: id } })
      )
    }

    return this.bulk({ body: [...indexBody, ...deleteBody] })
  }

  /**
   * Delete document by ID
   * @param index
   * @param id
   * @param refresh
   */
  async ogDelete(index: string, id: string, refresh: boolean = true) {
    return this.delete({
      index: this._getIndexWithPrefix(index),
      id,
      refresh,
    })
  }

  /**
   * Delete documents by special query
   * @param index
   * @param body
   * @param refresh
   */
  async ogDeleteByQuery(index: string, body: SearchRequest['body'], refresh: boolean = true){
    return this.deleteByQuery(<DeleteByQuery>{
      index: this._getIndexWithPrefix(index),
      body,
      refresh
    })
  }

  /**
   * Search operation
   * @param index
   * @param body
   */
  async ogSearch<ResponseType = any, AggregationsType extends AggregationsAggregate = AggregationsAggregate>(index: string, body: SearchRequest['body']){
    return this.search<OpeserSearchResponseType<ResponseType,AggregationsType>>({
      index: this._getIndexWithPrefix(index),
      body
    })
  }

  /**
   * Get document by ID
   * @param index
   * @param id Document ID
   */
  async ogGet<ResponseType = any>(index: string, id: string){
    return this.get<SearchHit<ResponseType>>({
      index: this._getIndexWithPrefix(index),
      id
    })
  }
}
