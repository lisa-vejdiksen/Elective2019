document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("save-button").addEventListener('click', function() {
        fetch('http://des-iis.ucn.dk:8190/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: "",
                preptime: "",
                cooktime: "",
                image: ""
            })
            .then(Response => {
                console.log(Response)
            })
        });
    })
},
false);
