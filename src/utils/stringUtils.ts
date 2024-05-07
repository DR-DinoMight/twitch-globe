//@ts-nocheck
function toSentenceCase(text: string) {
    return text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function(c) {
    return c.toUpperCase();
    });
}

export {toSentenceCase}
