import { Schema } from "mongoose";
import { OpeserService } from "../opeser.service";
import { OpeserMappingStorage } from "../storage/opeser-mapping.storage";
import { OpeserPluginConnector } from "../types/opeser-plugin-connector.type";

// TODO: rename
export const OpeserConnectPluginFactory =
  (client: OpeserService, prefix?: string): OpeserPluginConnector =>
  (index: string, schema: Schema, options) => {
    const { settings, map } = OpeserMappingStorage.getSchemaByIndex(index);
  };
