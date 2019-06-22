module.exports.dateValidator = (date) => {
    const dateRegex = /^((0?\d)|(1[012]))\-((0?\d)|((1|2)\d)|(3(0|1)))\-\d{4}$/
    if(!dateRegex.test(date)){
        return false
    }

    return true
}