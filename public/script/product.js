var module = angular.module("myModule", []);
module.controller("myController", function ($scope, $http) {

    $scope.jsonArray = [];
    $scope.selObj = {};  // Initialize selObj

    // Fetch all records for the active user
    $scope.fetchRecords = function () {
        var p = localStorage.getItem("Active_Product");
        $scope.selObj.txtProduct = p;

        // Create the URL with the email appended as a query parameter
        var url = "/get-angular-product-records?productID=" + encodeURIComponent($scope.selObj.txtProduct);

        // Make the GET request
        $http.get(url).then(
            function done(response) {
                $scope.jsonArray = response.data;
            },
            function fail(response) {
                alert(response.data);
            }
        );
    };

    $scope.showUser = function (email) {
        localStorage.setItem("Active_Email", email);
        
    };


    // Initial fetch of records on controller load
    $scope.fetchRecords();
});

$(document).ready(function () {

    

    $(document).on('click', '#buyerdetail', function () {
        var item = $(this).closest('.list-group-item');
        
        var buyerProductID = localStorage.getItem("Active_Product");

        // Fetch input values
        var buyerEmail = $("#buyerEmail").val();
        var buyerName = $("#buyerName").val();
        var buyerAddress = $("#buyerAddress").val();
        var buyerCountry = $("#buyerCountry").val();
        var buyerState = $("#buyerState").val();
        var buyerCity = $("#buyerCity").val();
        var buyerISD = $("#buyerISD").val();
        var buyerNumber = $("#buyerNumber").val();

        // Proceed with AJAX request only if the validation passes
        $.ajax({
            type: "POST",
            url: "/buyer-Account",
            data: {
                somebuyerProductID: buyerProductID,
                somebuyerEmail: buyerEmail,
                somebuyerName: buyerName,
                somebuyerAddress: buyerAddress,
                somebuyerCountry: buyerCountry,
                somebuyerState: buyerState,
                somebuyerCity: buyerCity,
                somebuyerISD: buyerISD,
                somebuyerNumber: buyerNumber
            },
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            processData: true
        })
        
        .done(function (response) {
            $("#buyer-submit").html("Details Submitted");
        })
        .fail(function (error) {
            $("#buyer-submit").html("An error occurred: " + error.responseText);
        });
    });


    // function setActiveUser() {
    //     var ae = localStorage.getItem("Active_Email");
    //     $.ajax({
    //         type: "GET",
    //         url: "/productUser-record",
    //         data: {
    //             someemail: ae
    //         },
    //         success: function (respJSONkuch) {
    //             if (Array.isArray(respJSONkuch) && respJSONkuch.length > 0) {
    //                 var user = respJSONkuch[0];
    //                 $(".username").text(user.name || 'N/A');
    //                 $(".useremail").text(user.email || 'N/A');
    //                 $(".country").text(user.country || 'N/A');
    //                 $(".state").text(user.state || 'N/A');
    //                 $(".city").text(user.city || 'N/A');

    //                 var email = user.email || 'default@example.com'; // Default email if none is found
    //                 var subject = encodeURIComponent("MechSwap");
    //                 var body = encodeURIComponent("Hello,\n\nI am reaching out to discuss..."); // Customize the body content
    //                 $("#messageLink").attr("href", "mailto:" + email + "?subject=" + subject + "&body=" + body);
    //             }

    //         }
    //     });
    //     $.get('/product-status', { txtEmail1: au }, function(data) {
    //         // Update the UI with the fetched data
    //         $('#postedCount').text(data.totalPosted || 0);
    //     }).fail(function() {
    //         alert("Error fetching product status");
    //     });

    // }

    // setActiveUser();

});
