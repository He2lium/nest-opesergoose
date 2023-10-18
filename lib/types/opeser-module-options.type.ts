import {FactoryProvider, ModuleMetadata} from "@nestjs/common";
import {ClientOptions} from "@opensearch-project/opensearch";

export interface OpeserOptions extends ClientOptions{}


export type OpeserAsyncOptions =
    Pick<ModuleMetadata, "imports"> &
    Pick<FactoryProvider<OpeserOptions>,"useFactory"|"inject">