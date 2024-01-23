import { Schema } from "mongoose";

export type OpeserPluginConnector = (
  index: string,
  schema: Schema,
  options,
) => void;
