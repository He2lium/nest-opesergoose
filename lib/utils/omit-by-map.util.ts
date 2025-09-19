import {MappingProperty} from "@opensearch-project/opensearch/api/types";
import { OpeserDocumentType } from '../types/opeser-document.type'

const fillResult = <T extends object>(objectPart: T, mapPart: Record<string, MappingProperty>) => {
    let resultPart: object = {}
    for (let fieldName in mapPart) {
        if (objectPart[fieldName] === undefined) continue
        resultPart[fieldName] =
            !!mapPart[fieldName].properties
                ?
                getPart(objectPart[fieldName], mapPart[fieldName].properties)
                :
                objectPart[fieldName]
    }
    return resultPart
}

const getPart = <T extends object>(objectPart: T | T[], mapPart: Record<string, MappingProperty>) => {
    let resultPart: object = {}
    if (Array.isArray(objectPart)) {
        let resultArray: object[] = []
        for (let objectPartElement of objectPart)
            resultArray.push(fillResult(objectPartElement, mapPart))
        resultPart = resultArray
    } else
        resultPart = fillResult(objectPart, mapPart)
    return resultPart
}


export const OmitByMapUtil = <T extends OpeserDocumentType>(map: Record<string, MappingProperty>, object: T) => {
    return getPart(object, map)
}