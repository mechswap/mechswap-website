document.addEventListener("DOMContentLoaded", function () {
    function showSection(sectionToShow) {
        // Array of sections to hide
        const sections = [".product-status", ".addproduct", ".manage-tools-form", ".myprofile", ".changePassword"];

        // Hide all sections
        sections.forEach(section => {
            document.querySelector(section).classList.add("hidden");
        });

        // Show the selected section
        document.querySelector(sectionToShow).classList.remove("hidden");
        document.querySelector(sectionToShow).classList.add("block");
    }

    // Initial load
    showSection(".product-status");
    // showSection(".success-message");

    // Add event listeners for menu items
    document.querySelector(".manage-account ul li:nth-child(1) a").addEventListener("click", function (event) {
        event.preventDefault();
        showSection(".product-status");
    });

    document.querySelector(".manage-account ul li:nth-child(2) a").addEventListener("click", function (event) {
        event.preventDefault();
        showSection(".manage-tools-form");
    });

    document.querySelector(".manage-account ul li:nth-child(3) a").addEventListener("click", function (event) {
        event.preventDefault();
        showSection(".addproduct");
    });

    document.querySelector(".manage-account ul li:nth-child(4) a").addEventListener("click", function (event) {
        event.preventDefault();
        showSection(".myprofile");
    });

    document.querySelector(".manage-account ul li:nth-child(5) a").addEventListener("click", function (event) {
        event.preventDefault();
        showSection(".changePassword");
    });

    document.querySelector(".add_product").addEventListener("click", function (event) {
        event.preventDefault();
        showSection(".addproduct");
    });
    document.querySelector(".add_product2").addEventListener("click", function (event) {
        event.preventDefault();
        showSection(".addproduct");
    });

    // Select the h1 element where the text will be changed
    const pageTitle = document.querySelector('.page_type');

    // Add event listeners to each list item
    document.getElementById('my-account').addEventListener('click', function () {
        pageTitle.textContent = 'My Account';
    });

    document.getElementById('manage-products').addEventListener('click', function () {
        pageTitle.textContent = 'Manage New/Used Products';
    });

    document.getElementById('add-product').addEventListener('click', function () {
        pageTitle.textContent = 'Add New/Used Product';
    });

    document.getElementById('my-profile').addEventListener('click', function () {
        pageTitle.textContent = 'My Profile';
    });

    document.getElementById('change-password').addEventListener('click', function () {
        pageTitle.textContent = 'Change Password';
    });

    setTimeout(function () {
        const successMessage = document.getElementById('success-message');
        if (successMessage) {
            successMessage.style.display = 'none';  // Hide the message
        }
    }, 5000);
});

function generateRandomProductId() {
    const letters = String.fromCharCode(Math.floor(Math.random() * 26) + 65) +
        String.fromCharCode(Math.floor(Math.random() * 26) + 65) +
        String.fromCharCode(Math.floor(Math.random() * 26) + 65);

    const number = Math.floor(1000 + Math.random() * 9000);

    return letters + '-' + number;
}

window.onload = function () {
    document.getElementById('productId').value = generateRandomProductId();
};


$(document).ready(function () {

    function setActiveUser() {
        var au = localStorage.getItem("Active_User");
        $("#txtEmail1").val(au).prop("readonly", true);
        $("#txtEmail2").val(au).prop("readonly", true);


        $.ajax({
            type: "GET",
            url: "/json-record",
            data: {
                kuchemail: au
            },
            success: function (respJSONkuch) {
                if (Array.isArray(respJSONkuch) && respJSONkuch.length > 0) {
                    var user = respJSONkuch[0];
                    $(".username").text(user.name || 'N/A');
                    $(".company-name").text(user.company_name || 'N/A');
                    $(".country").text(user.country || 'N/A');
                    $(".state").text(user.state || 'N/A');
                    $(".city").text(user.city || 'N/A');
                    $(".membership-date").text(user.dos);
                    $("#txtCompanyName").val(user.company_name || 'N/A');
                    $("#txtCompanyDetail").val(user.company_details || 'N/A');
                    $("#txtUserName").val(user.name || 'N/A');
                    $("#txtUserAddress").val(user.address || 'N/A');
                    $("#txtUserCountry").val(user.country || 'N/A');
                    $("#txtUserState").val(user.state || 'N/A');
                    $("#txtUserCity").val(user.city || 'N/A');
                    $("#txtUserISD").val(user.isd || 'N/A');
                    $("#txtUserMobile").val(user.number || 'N/A');
                }

            }
        });
        $.get('/product-status', { txtEmail1: au }, function(data) {
            // Update the UI with the fetched data
            $('#postedCount').text(data.totalPosted || 0);
        }).fail(function() {
            alert("Error fetching product status");
        });

    }

    setActiveUser();




    $("#updateButton").click(function () {
        var email = $("#txtEmail2").val();
        var companyName = $("#txtCompanyName").val();
        var companyDetail = $("#txtCompanyDetail").val();
        var userName = $("#txtUserName").val();
        var userAddress = $("#txtUserAddress").val();
        var userCountry = $("#txtUserCountry").val();
        var userState = $("#txtUserState").val();
        var userCity = $("#txtUserCity").val();
        var userISD = $("#txtUserISD").val();
        var userMobile = $("#txtUserMobile").val();

        $.ajax({
            type: "POST",
            url: "/update-user",
            data: {
                email: email,
                companyName: companyName,
                companyDetail: companyDetail,
                userName: userName,
                userAddress: userAddress,
                userCountry: userCountry,
                userState: userState,
                userCity: userCity,
                userISD: userISD,
                userMobile: userMobile
            },
            success: function (response) {
                alert("User details updated successfully.");
            },
            error: function (xhr, status, error) {
                alert("Error: " + xhr.responseText);
            }
        });
    });



    $("#submitPasswordChange").click(function () {
        var currentPassword = $("#current-password").val();
        var newPassword = $("#new-password").val();
        var reenterPassword = $("#reenter-password").val();
        var email = $("#txtEmail1").val();  // Ensure this input field exists in your form

        if (newPassword !== reenterPassword) {
            alert("New password and Re-enter password do not match.");
            return;
        }

        $.ajax({
            type: "POST",
            url: "/change-password",
            data: {
                currentPassword: currentPassword,
                newPassword: newPassword,
                UserUserEmail: email  // Make sure this matches the backend
            },
            success: function (response) {
                alert(response);
            },
            error: function (xhr, status, error) {
                alert("Error: " + xhr.responseText);
            }
        });
    });

    $("#submitInfo").click(function () {
        var formData = new FormData();
        formData.append('some_product_id', $("#productId").val());
        formData.append('some_Email', $("#txtEmail1").val());
        formData.append('some_usage_type', $("#usage_Type").val());
        formData.append('some_product_name', $("#product_Name").val());
        formData.append('some_model_no', $("#model_No").val());
        formData.append('some_country_mfg', $("#country_Mfg").val());
        formData.append('some_capacity', $("#capacity").val());
        formData.append('some_warranty', $("#warranty").val());
        formData.append('some_usage_years', $("#usage_Years").val());
        formData.append('some_specification', $("#specification").val());
        formData.append('some_currency', $("#currency").val());
        formData.append('some_price', $("#price").val());
        formData.append('some_quantity', $("#quantity").val());
        formData.append('some_main_image', $("#main_Image")[0].files[0]);
        formData.append('some_image1', $("#image1")[0].files[0]);
        formData.append('some_image2', $("#image2")[0].files[0]);
        formData.append('some_categoryVal', $("#category").val());
        formData.append('some_category', $("#category option:selected").text());
        formData.append('some_subcategory', $("#subcategory").val());

        $.ajax({
            type: "POST",
            url: "/add-product",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                alert("Product added successfully.");
                location.reload();
            },
            error: function (xhr, status, error) {
                alert("Error: " + xhr.responseText);
            }
        });
    });
    
    
});


//=========================== Manage Product Detail =============================
var module = angular.module("myModule", []);
module.controller("myController", function ($scope, $http) {

    $scope.jsonArray = [];
    $scope.selObj = {};  // Initialize selObj

    // Fetch all records for the active user
    $scope.fetchRecords = function () {
        var au = localStorage.getItem("Active_User");  // Get the active user from localStorage
        $scope.selObj.txtEmail1 = au;  // Assign active user's email to selObj

        // Create the URL with the email appended as a query parameter
        var url = "/get-angular-all-records?email=" + encodeURIComponent($scope.selObj.txtEmail1);

        // Make the GET request
        $http.get(url).then(
            function done(response) {
                $scope.jsonArray = response.data;
            },
            function fail(response) {
                alert(response.data);
            }
        );
    }

    // Function to remove a product by ID
    $scope.doRemove = function (productID) {
        var url = "/do-angular-remove?productID=" + productID;

        $http.get(url).then(
            function done(response) {
                alert(response.data);
                // Refresh the records after successful deletion
                $scope.fetchRecords();
            },
            function fail(response) {
                alert(response.data);
            }
        );
    }

    // Initial fetch of records on controller load
    $scope.fetchRecords();

});




