import {Inject} from "@nestjs/common";
import {OPESER_CLIENT_TOKEN} from "../opeser.constants";

export const InjectOpeser = () => Inject(OPESER_CLIENT_TOKEN)