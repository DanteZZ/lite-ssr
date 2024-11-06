function serializeObject(obj: any) {
    return JSON.stringify(obj, (key, value) => {
        if (value instanceof Map) {
            return { _type: 'Map', value: Array.from(value.entries()) };
        } else if (value instanceof Set) {
            return { _type: 'Set', value: Array.from(value) };
        }
        return value;
    });
}

function deserializeObject(json: string) {
    return JSON.parse(json, (key, value) => {
        if (value && value._type === 'Map') {
            return new Map(value.value);
        } else if (value && value._type === 'Set') {
            return new Set(value.value);
        }
        return value;
    });
}

export { serializeObject, deserializeObject };