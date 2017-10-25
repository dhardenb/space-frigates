function removeByAttr(arr, attr, value) {

    var i = arr.length;

    while(i--) {

        if( arr[i]

            && arr[i].hasOwnProperty(attr)

            && (arguments.length > 2 && arr[i][attr] === value ) ) {

                arr.splice(i,1);

            }

        }

    return arr;

}

export { removeByAttr };
