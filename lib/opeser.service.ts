import { Injectable } from "@nestjs/common";
import { Client } from "@opensearch-project/opensearch";
import { OpeserOptions } from "./types/opeser-module-options.type";

@Injectable()
export class OpeserService extends Client {
  constructor(options: OpeserOptions) {
    super(options);
  }
}
