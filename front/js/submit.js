$('#submit').click(function()
{
    $.ajax({
        url: 127.0.0.1:8080/set_light,
        type:'POST',
        data:
        {
            id_dev : S01
        }             
    });
});