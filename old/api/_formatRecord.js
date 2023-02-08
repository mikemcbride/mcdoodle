export default function (rec) {
    if (Array.isArray(rec)) {
        return rec.map(it => formatOne(it))
    } else {
        return formatOne(rec)
    }
}

function formatOne(rec) {
    return { id: rec.id, ...rec.fields }
}
