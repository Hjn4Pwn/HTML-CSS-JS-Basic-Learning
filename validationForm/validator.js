function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    let selectorRules = {}; // save all rules

    function validate(inputElement, rule) {
        getParentwithSpecifiedSelector = getParent(inputElement, options.formGroupSelector);

        // truy xuất thẻ cha => gọi đến thẻ con => do có nhiều class trùng tên
        let errorElement = getParentwithSpecifiedSelector.querySelector(options.errorSelector);

        // undefine khi không có lỗi
        //let errorMessage = rule.test(inputElement.value); // nếu gán như này thì errorMessage sẽ là của thằng rule cuối cùng
        let errorMessage;

        // lấy các rules của selector hiện tại
        let rules = selectorRules[rule.selector];
        // 1 selector có nhiều rules
        for (let i = 0; i < rules.length; i++) {

            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) {
                break;
            }
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;

            // thêm class style cho error message
            getParentwithSpecifiedSelector.classList.add(options.errorClass);
        }
        else {
            errorElement.innerText = "";
            getParentwithSpecifiedSelector.classList.remove(options.errorClass);

        }
        // ! undefine => true => no error
        return !errorMessage;
    }

    // lấy element của form cần validate
    // console.log(options.form) // return #form-1
    let formElement = document.querySelector(options.form);

    if (formElement) {

        // loại bỏ hành vi mặc định của submit
        formElement.onsubmit = function (e) {
            e.preventDefault();

            let isValid = true;
            options.rules.forEach(function (rule) {

                let inputElement = formElement.querySelector(rule.selector);
                if (!validate(inputElement, rule)) {
                    isValid = false;
                }
            });

            // nếu đã fill hết thì sẽ return về data
            if (isValid) {

                // submit with js
                if (typeof options.onSubmit === "function") {

                    // get all has attribute name, dont have disable
                    // pải có trường name mới match rule được
                    let getAllUserInput = formElement.querySelectorAll('[name]:not([disabled])');

                    let formValues = Array.from(getAllUserInput).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                                let checkedInput = formElement.querySelector('input[name="' + input.name + '"]:checked');
                                if (checkedInput) {
                                    values[input.name] = checkedInput.value;
                                }
                                break;
                            case 'checkbox':
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                if (!input.matches(':checked')) {
                                    values[input.name].push("");
                                    // return values;
                                }
                                else {
                                    values[input.name].push(input.value);
                                }

                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                // console.log(input.name);
                                values[input.name] = input.value;
                        }

                        return values;

                    }, {});

                    options.onSubmit(formValues);
                }

                // submit with default
                else {
                    formElement.submit();
                }
            }
        }

        // loop over rules,then process
        options.rules.forEach(function (rule) {

            // Save rules
            if (Array.isArray(selectorRules[rule.selector])) {
                // rule test = function
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }


            let inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {

                getParentwithSpecifiedSelector = getParent(inputElement, options.formGroupSelector);
                // xử lý case blur ra khỏi input
                inputElement.onblur = function () {
                    // trigger event blur
                    // console.log('blur' + rule.selector);
                    // value người dùng nhập
                    // console.log(inputElement.value);
                    validate(inputElement, rule);
                }

                // xử lý case khi đang báo lỗi, ng dùng nhập vào thì hết báo lỗi
                inputElement.oninput = function () {
                    // show ra value user typed
                    // console.log(inputElement.value);
                    let errorElement = getParentwithSpecifiedSelector.querySelector(options.errorSelector);
                    errorElement.innerText = "";
                    getParentwithSpecifiedSelector.classList.remove(options.errorClass);
                }
            });
        });

    }
}

Validator.isRequired = function (selector) {

    return {
        selector: selector,
        // function check user typed?
        test: function (value) {
            // return value.trim() ? undefined : "Please fill in this field"
            return value ? undefined : "Please fill in this field"
        }
    };
}

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        // function check isEmail?
        test: function (value) {
            let pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            return pattern.test(value) ? undefined : "Your email is invalid";
        }
    };
}

Validator.isPassword = function (selector) {
    return {
        selector: selector,
        // function check isPassword?
        test: function (value) {
            let pattern = /^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[#$@!%&*?^()]).{8,20}$/;
            return pattern.test(value) ? undefined : "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, 1 special character, and be 8-20 characters long";
        }
    };
}


Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,

        test: function (value) {
            return value === getConfirmValue() ? undefined : message || "Input does not match";
        }
    };
}