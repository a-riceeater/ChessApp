module.exports = {
    createRandomId: function (length = 0) {
        if (!length) length = 26;
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567891234567890';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            var c = characters.charAt(Math.floor(Math.random() * charactersLength));
            if (is_numeric(c) && counter == 0) c = "a"
            result += c;
            counter += 1;
        }
    }
}