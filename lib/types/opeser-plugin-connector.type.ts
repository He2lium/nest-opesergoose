import { Schema } from "mongoose";
import { OpeserOptions } from "opesergoose";

export type OpeserPluginConnector = (
  index: string,
  schema: Schema,
  options: Omit<OpeserOptions.PluginOptions, "index" | "mapProperties">
) => void;
