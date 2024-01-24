import {
  IndicesIndexSettings,
  MappingProperty,
} from "@opensearch-project/opensearch/api/types";
import { OpeserStorageType } from "../types/opeser-storage.type";
import field = OpeserStorageType.field;
import { GetFiledMapUtil } from "../utils/get-filed-map.util";
import { OpeserMappingStorage } from "../storage/opeser-mapping.storage";
import merge from "lodash/merge";

export const OgSchema = (
  index?: string,
  settings: IndicesIndexSettings = {},
  forbiddenFields?: string[]
) => {
  return function (target: any) {
    const fields: field[] = OpeserMappingStorage.getProps(target.name);
    const mapping: Record<string, MappingProperty> = {};

    for (let field of fields) {
      const { map, analysis } = GetFiledMapUtil(field.options);
      mapping[field.key] = map;
      settings.analysis = merge(settings.analysis, analysis);

      if (field.virtual) {
        const { map, analysis } = GetFiledMapUtil(field.virtual);
        mapping[`_${field.key}`] = map;
        settings.analysis = merge(settings.analysis, analysis);
      }
    }
    OpeserMappingStorage.setSchema({
      index,
      class: target.name,
      settings,
      map: mapping,
      forbiddenFields
    });
  };
};
