module.exports = {
    parseStatusCode: str => {
        if (typeof str !== 'string') {
            str = str.toString();
        }

        let code = 500;

        if (str.indexOf('Status code:') !== -1) {
            code = str.replace(/[()]/g, '').split('Status code: ')[1];
        }

        return code;
    }
};
