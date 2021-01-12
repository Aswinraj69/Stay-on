$(document).ready(function () {
    $("button").click(function () {
        search()
    });
});

function search() {

    let food = $('#food').val()
    $.ajax({
        url: '/searchfood',
        data: { food: food },
        method: 'post',
        success: (response) => {
            if(response){
                $('#searchoutput').fadeOut(200, function(){
                    $.each(response,function(index,value){
                        $('#foods').load(location.href+" #foods")
                    })
                   
                    // let n=response.length
                    // $('#food_image').attr('src','/hotel/food-images/'+response[0]._id+'.jpg')
                    // $('#foodid').attr('value',response[0]._id)
                    // document.getElementById('food_name').innerText=""+response[0].foodname
                    // document.getElementById('restuarant_name').innerText=""+response[0].restaurant
                    // document.getElementById('food_price').innerText=""+response[0].price
                    
                   
                  
                })
            }
        
        }
    })
    
}
