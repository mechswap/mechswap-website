$(document).ready(function () {
    $("#createAccount").click(function (event) {
        event.preventDefault(); // Prevent form submission

        // Fetch input values
        var email = $("#txtEmail").val();
        var password = $("#txtPwd").val();
        var confirmPassword = $("#txtConfirmPwd").val();
        var name = $("#txtName").val();
        var company_name = $("#txtCompany_name").val();
        var company_detail = $("#txtCompany_detail").val();
        var address = $("#txtAddress").val();
        var country = $("#txtCountry").val();
        var state = $("#txtState").val();
        var city = $("#txtCity").val();
        var isd = $("#txtISD").val();
        var number = $("#txtNumber").val();

        // Clear previous error messages
        $("#pwdError").text('');
        $("#confirmPwdError").text('');

        // Password validation
        var isValid = true;
        if (password.length < 8) {
            $("#pwdError").text('Password must be at least 8 characters long.');
            isValid = false;
        }
        if (password !== confirmPassword) {
            $("#confirmPwdError").text('Passwords do not match.');
            isValid = false;
        }

        // Proceed with AJAX request only if the validation passes
        if (isValid) {
            var obj = {
                type: "POST",
                url: "/create-Account",
                data: {
                    someEmail: email,
                    somePwd: password,
                    someName: name,
                    someCompany_name: company_name,
                    someCompany_detail: company_detail,
                    someAddress: address,
                    someCountry: country,
                    someState: state,
                    someCity: city,
                    someISD: isd,
                    someNumber: number
                },
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // Set content type
                processData: true // Data is in URL encoded format
            };

            // Send the AJAX request
            $.ajax(obj)
                .done(function (response) {
                    // Handle success case
                    $("#btn-submit").html("Account created successfully!");
                })
                .fail(function (error) {
                    // Handle error case
                    if (error.status === 400) {
                        $("#btn-submit").html("Email is already registered.");
                    } else {
                        $("#btn-submit").html("An error occurred: " + error.responseText);
                    }
                });
        } else {
            // Show general error message if passwords do not meet the criteria
            $("#btn-submit").html("Please fix the errors in the form.");
        }
    });

    $("#login").click(function () {
        var email = $("#txtLogin_email").val();
        var pwd = $("#txtLogin_password").val();
        var obj = {
            type: "get",
            url: "/do-login",
            data: {
                someEmail: email,
                somePwd: pwd
            }
        }
        $.ajax(obj).done(function (respJSONkuch) {
            localStorage.setItem("Active_User", $("#txtLogin_email").val());

            if (respJSONkuch == "OK")
                location.href = "../seller.html";
            else if (respJSONkuch == "ADMIN")
                location.href = "dash-admin.html";
            else
                alert(respJSONkuch);
        }).fail(function (errkuch1) {
            alert(errkuch1);
        })

    });

    $("#forgot").click(function (event) {
        event.preventDefault(); // Prevent form submission
    
        // Fetch input values
        var email = $("#txtForgot_email").val();
    
        var obj = {
            type: "POST",
            url: "/forgot-Account",
            data: {
                someEmail: email, // Sending data via POST body
            },
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // Set content type
            processData: true // Data is in URL encoded format
        };
    
        // Send the AJAX request
        $.ajax(obj)
            .done(function (response) {
                // Handle success case
                $("#btn-forgot").html("Login credentials sent");
            })
            .fail(function (error) {
                // Handle error case
                if (error.status === 400) {
                    $("#btn-forgot").html("Email not registered.");
                } else {
                    $("#btn-forgot").html("An error occurred: " + error.responseText);
                }
            });
    });
    
});