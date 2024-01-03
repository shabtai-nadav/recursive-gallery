export const Sort = {
    Created: 'created',
    Modified: 'modified',
    Size: 'size',
    Shuffle: 'shuffle',
    Directory: 'directory',
    Name: 'name'
}

export const SortDirection = {
    Asc: 1,
    Desc: -1
}

export function sortDate(date1, date2, direction) {
    return basicSort(date1, date2, direction) * -1;
}

export function basicSort(a, b, direction) {
    let result = 0;

    if (a > b) {
        result = 1;
    }

    if (b > a) {
        result = -1;
    }

    return result * direction;
}