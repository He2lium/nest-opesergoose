import {FactoryProvider, ModuleMetadata} from "@nestjs/common";
import {ClientOptions} from "@opensearch-project/opensearch";

export interface OpeserOptions extends ClientOptions{
    prefix?: string
}


export type OpeserAsyncOptions =
    Pick<ModuleMetadata, "imports"> &
    Pick<FactoryProvider<OpeserOptions>,"useFactory"|"inject">