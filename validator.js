function Validator(formselector) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var formRules = {}
    //Mong muon nhu nay
    // var formRules = {
    //     fullName: 'required',
    //     email: 'required|email',
    // }


    /**
    Quy uoc tao rules:
     * Neu co loi return `message` loi
     * Neu khong co loi return undefined
     */
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        //min(6) = f(value)-> min:f(6) -> min:6
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập đủ ${min} ký tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.lenght <= max ? undefined : `Vui lòng nhập tối đa ${max} ký tự`
            }
        },
    }



    //Lay ra form element trong DOM theo form selector
    var formElement = document.querySelector(formselector)

    //Chi xu ly khi ton tai form element
    if (formElement) {

        //lay ra the input voi attribute name&&rules
        var inputs = formElement.querySelectorAll("[name][rules]")

        for (var input of inputs) { //array dung of obj dung in

            var rules = input.getAttribute("rules").split("|")

            for (var rule of rules) {

                var ruleInfo //danh cho cac rule co tham so vd min:6
                var isRuleHasValue = rule.includes(':')

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':')

                    rule = ruleInfo[0] //lay min: 
                    // console.log(validatorRules[rule](ruleInfo[1]))
                }

                var ruleFunc = validatorRules[rule]

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }

            }

            //Lang nghe su kien da validate (blur, change, ... )
            input.onblur = handleValidate
            input.oninput = handleClearError
        }

        //Ham thu hien validate
        function handleValidate(event) {
            var rules = formRules[event.target.name]
            var errorMessage

            rules.find(
                function (rule) {
                    errorMessage = rule(event.target.value)
                    return errorMessage
                }
            )

            //Neu co loi thi hien thi message loi ra UI
            if (errorMessage) {

                var formGroup = getParent(event.target, '.form-group')

                if (formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage) {
                        formMessage.innerText = errorMessage
                    }
                }

            }
        }

        //Ham clear message loi khi nguoi dung dang nhap
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group')
            if (formGroup.matches('.invalid')) {
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message')

                if (formMessage) {
                    formMessage.innerText = ''
                }
            }
        }

        //Xu li hanh vi submit form
        formElement.onsubmit = function (event) {
            event.preventDefault()

            var inputs = formElement.querySelectorAll("[name][rules]")
            
            for (var input of inputs) {
                handleValidate({
                    target: input
                })
            }

        }
    }
}