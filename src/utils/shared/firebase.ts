export function toFirebaseDoc<Type>(obj: Type): any {
    const data: any = { ...obj };
    delete data.id;
    return data;
}

export function fromFirebaseDoc<Type>(doc: any): Type {
    const data = doc.data();

    const convertedData = convertData(data);
    if (convertedData) {
        convertedData.id = doc.id;
    }

    return convertedData;
}

const convertData = (value: any): any => {
    if (!value) {
        return value;
    }

    if (typeof value !== 'object') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(convertData);
    }

    if (value.toDate) {
        return value.toDate();
    }

    const convertedData: any = {};
    for (const key of Object.keys(value)) {
        convertedData[key] = convertData(value[key]);
    }

    return convertedData;
}

export function fromFirebaseDocs<Type>(docs: Array<any>): Array<Type> {
    return docs.map(doc => fromFirebaseDoc<Type>(doc));
}
