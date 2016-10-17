module.exports = {
    parseStatusCode: str => {
        if (typeof str !== 'string') {
            str = str.toString();
        }

        let code = 500;

        if (str.indexOf('Status code:') !== -1) {
            code = parseInt(str.replace(/[()]/g, '').split('Status code: ')[1], 10);
        }

        return code;
    }
};
