import {IndicesIndexSettings, MappingProperty} from '@opensearch-project/opensearch/api/types'
import {OpeserStorageType} from '../types/opeser-storage.type'
import field = OpeserStorageType.field
import {GetFieldMapUtil} from '../utils/get-field-map.util'
import {OpeserMappingStorage} from '../storage/opeser-mapping.storage'
import merge from 'lodash/merge'

export const OgSchema = (index?: string, settings: IndicesIndexSettings = {}) => {
    return function (target: Function) {

        // Get list of fields with options
        const fields: field[] = OpeserMappingStorage.getProps(target.name)

        // Set empty map for filling
        const mapping: Record<string, MappingProperty> = {}

        // Set map with options
        for (let field of fields) {
            const {map, analysis} = GetFieldMapUtil(field.options)
            mapping[field.key] = map
            if (analysis) settings.analysis = merge(settings.analysis, analysis)
        }

        // Save schema to global storage
        OpeserMappingStorage.setSchema({
            index,
            class: target.name,
            settings,
            map: mapping,
        })
    }
}
