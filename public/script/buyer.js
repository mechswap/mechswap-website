var module = angular.module("myModule", []);
module.controller("myController", function ($scope, $http) {
    $scope.groupedCategories = {};

    //====================Get Records================================================
    var url = "/get-angular-buyer-records";
    $http.get(url).then(done, fail);

    function done(response) {
        // Grouping products by category with count of subcategories
        $scope.jsonArray = response.data;

        $scope.groupedCategories = $scope.jsonArray.reduce((acc, product) => {
            // If the category doesn't exist yet, initialize it
            if (!acc[product.category]) {
                acc[product.category] = {
                    category: product.category,
                    subCategories: []
                };
            }
            // Add sub_category and count to the subCategories array
            acc[product.category].subCategories.push({
                name: product.sub_category,
                count: product.count
            });
            return acc;
        }, {});
    }

    function fail(response) {
        alert(response.data);
    }
    
    $scope.showSubCategoryAlert = function (subCategoryName) {
        
        localStorage.setItem("Active_subcategory", subCategoryName);
        location.href = "../variety.html";
    };
    $scope.showCategoryAlert = function (CategoryName) {
        localStorage.setItem("Active_category", CategoryName);
    };
});


function filterCategories(letter) {
    const categories = document.querySelectorAll('.category-card'); // Use the correct class

    categories.forEach(category => {
        const categoryTitle = category.querySelector('h2').textContent.trim();

        if (letter === 'All') {
            category.style.display = 'block';
        } else if (categoryTitle.startsWith(letter)) {
            category.style.display = 'block';
        } else {
            category.style.display = 'none';
        }
    });
}



