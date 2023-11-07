export const validateEmailList = (emailListText: string) => {
    const emails = emailListText.split(/[,\s;\n]+/);

    if (!emails || emails.length < 1) {
        return false;
    }

    return emails.every(validateEmail)
}

export const validateEmail = (emailText: string) => {
    if (!emailText) {
        return false;
    }

    return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(emailText);
}
