import {MappingProperty} from "@opensearch-project/opensearch/api/types";

const fillResult = (objectPart: any, mapPart: Record<string, MappingProperty>) => {
    let resultPart: any = {}
    for (let fieldName in mapPart) {
        if (!objectPart[fieldName]) continue
        resultPart[fieldName] =
            !!mapPart[fieldName].properties
                ?
                getPart(objectPart[fieldName], mapPart[fieldName].properties)
                :
                objectPart[fieldName]
    }
    return resultPart
}

const getPart = (objectPart: any | any[], mapPart: Record<string, MappingProperty>) => {
    let resultPart: any = {}
    if (Array.isArray(objectPart)) {
        let resultArray = []
        for (let objectPartElement of objectPart)
            resultArray.push(fillResult(objectPartElement, mapPart))
        resultPart = resultArray
    } else
        resultPart = fillResult(objectPart, mapPart)
    return resultPart
}


export const OmitByMapUtil = (map: Record<string, MappingProperty>, object: any) => {
    return getPart(object, map)
}