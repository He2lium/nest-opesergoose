import { DynamicModule, Module } from "@nestjs/common";
import { OpeserService } from "./opeser.service";
import {
  OPESER_CLIENT_OPTIONS_TOKEN,
  OPESER_CLIENT_TOKEN,
} from "./opeser.constants";
import {
  OpeserAsyncOptions,
  OpeserOptions,
} from "./types/opeser-module-options.type";

@Module({})
export class OpeserModule {
  static forRootAsync(options: OpeserAsyncOptions): DynamicModule {
    return {
      module: OpeserModule,
      global: true,
      imports: options.imports,
      providers: [
        {
          provide: OPESER_CLIENT_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: OPESER_CLIENT_TOKEN,
          useFactory: (options: OpeserOptions) => new OpeserService(options),
          inject: [OPESER_CLIENT_OPTIONS_TOKEN],
        }
      ],
      exports: [OPESER_CLIENT_TOKEN],
    };
  }
}
