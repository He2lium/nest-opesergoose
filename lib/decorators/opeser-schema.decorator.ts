import { IndicesIndexSettings, MappingProperty } from '@opensearch-project/opensearch/api/types'
import { OpeserStorageType } from '../types/opeser-storage.type'
import field = OpeserStorageType.field
import { GetFiledMapUtil } from '../utils/get-filed-map.util'
import { OpeserMappingStorage } from '../storage/opeser-mapping.storage'
import merge from 'lodash/merge'
import {TransformDocumentFunctionType} from "../types/opeser-decorator.type";

export const OgSchema = (index?: string, settings: IndicesIndexSettings = {}, transform?: TransformDocumentFunctionType) => {
  return function (target: any) {
    const fields: field[] = OpeserMappingStorage.getProps(target.name)
    const mapping: Record<string, MappingProperty> = {}

    for (let field of fields) {
      const { map, analysis } = GetFiledMapUtil(field.options)
      mapping[field.key] = map
      if (analysis) settings.analysis = merge(settings.analysis, analysis)
    }
    OpeserMappingStorage.setSchema({
      index,
      class: target.name,
      settings,
      map: mapping,
      transform
    })
  }
}
