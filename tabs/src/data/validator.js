
let mandatoryText = "Please fill out this field!";

export function validatePhone(value) {
    if (value) {
        let reg = new RegExp(/^-?[+0-9. -]+$/).test(value);
        if (!reg) {
            return "Only numbers and characters +, -, . are allowed.";
        }
    }
}


export function validateName(value) {
    if (!value) {
        return mandatoryText;
    }
    if (value.length < 2) {
        return 'Please enter at least 2 characters!'
    }
}


export function validateMandatoryField(value) {
    if ((Array.isArray(value) && !value.length) || !value) {
        return mandatoryText;
    }
}