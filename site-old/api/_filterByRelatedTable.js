export default function (tableName, recordName) {
    return { filterByFormula: `FIND("${recordName}", ARRAYJOIN({${tableName}})) > 0`}
}
