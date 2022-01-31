var base1 = document.getElementById("base1-img");
var base2 = document.getElementById("base2-img");

var final_img = document.getElementById("fusion-img");

var key_arr = [];

//FIREBASE
firebase.initializeApp({
    apiKey: "AIzaSyAjXXuSq9qD9ZgujWAslV4K5u7jTDYZkrQ",
    authDomain: "image-generator-a2d11.firebaseapp.com",
    projectId: "image-generator-a2d11",
    storageBucket: "image-generator-a2d11.appspot.com",
    messagingSenderId: "55168770996",
    appId: "1:55168770996:web:2c73820e1d3007049f08e1",
    measurementId: "G-C7Q8SWQNHQ"
});

var database = firebase.firestore();

function submitAnimation() {

    $("#form-container").delay(100).animate({opacity: "0", marginTop: "10v"}, 600);
    $("#img-upload-container").fadeIn(300);
    $("#img-upload-container").delay(100).animate({opacity: "1", marginTop: "0"}, 600);
}

document.getElementById("city-input").onkeydown = function(e) {

    if (key_arr.length >= 3) {

        $("#submit-button").fadeIn(300);
    
    } else {

        $("#submit-button").fadeOut(300);
    }

    if (e.key === "Backspace" || e.key === "Enter") {

        key_arr.pop();
        console.log(key_arr);
    
    } else {

        key_arr.push(e.key);
        console.log(key_arr);
    }

    if (e.key === "Enter") {

        if (key_arr.length >= 3) {

            submitAnimation();
        
        } else {

            alert("error");
        }
    }

}

document.getElementById("submit-button").onmousedown = function(e) {

    submitAnimation();
}

var img1 = document.getElementById("base1-upload-actual");

img1.addEventListener("change", function() {

    if (img1.files.length >= 1) {

        document.getElementById("base1-upload").innerHTML = "IMG1: " + img1.value;
        base1.src = URL.createObjectURL(img1.files[0]);
    }
});

var img2 = document.getElementById("base2-upload-actual");

img2.addEventListener("change", function() {

    if (img2.files.length >= 1 && img1.files.length >= 1) {

        document.getElementById("base2-upload").innerHTML = "IMG2: " + img2.value;
        base2.src = URL.createObjectURL(img2.files[0]);

        setInterval(function() {

            $("#confirm-img-button").fadeIn();
            $("#confirm-img-button").fadeOut();

        }, 800);
    }
});

//WEBGL
var scene, camera, renderer, load_icon;

function init() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById("loading-page").appendChild(renderer.domElement);
    
    window.addEventListener("resize", function() {

        var width = window.innerWidth;
        var height = window.innerHeight;

        renderer.setSize(width, height);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    var load_geo = new THREE.DodecahedronBufferGeometry(2, 0);
    var load_mat = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});
    load_icon = new THREE.Mesh(load_geo, load_mat);
    scene.add(load_icon);
}

var render = function() {

    renderer.render(scene, camera);

    load_icon.rotation.x += 0.005;
    load_icon.rotation.y += 0.005;
}

var animate = function() {

    requestAnimationFrame(animate);

    render();
}

window.onload = function() {

	var ref = firebase.storage().ref("generated-images");
    var files = [];

    ref.listAll().then(function(result) {

        result.items.forEach(function(image_ref) {

            image_ref.getDownloadURL().then(function(url) {

                files.push(url);
                        
                var img = document.createElement("img");
                var home_page = document.getElementById("home-page-canvas");
                img.classList.add("home-page-images");
                img.src = url;

                home_page.appendChild(img);
                $(".home-page-images").fadeIn(1000);
            });
        });
    });
}

var view_counter = 0;

$(document).ready(function() {

    $("#create-bar").on("click", function() {

        $("#view-bar").fadeOut(400);
        $("#view-all-container").fadeOut(400);
        $("#home-page-canvas").animate({opacity: "0"}, 300);
        $("#creation-container").delay(1000).animate({opacity: "1", marginTop: "0"}, 700);
    });

    $("#view-bar").on("click", function() {

        if (view_counter == 0) {
            $("#home-page-canvas").fadeOut(100);
            $("#view-all-container").fadeIn(200);

            var ref = firebase.storage().ref("generated-images");
            var files = [];

            ref.listAll().then(function(result) {

                result.items.forEach(function(image_ref) {

                    image_ref.getDownloadURL().then(function(url) {

                        files.push(url);
                        
                        var img = document.createElement("img");
                        var viewall_container = document.getElementById("view-all-container");
                        img.classList.add("view-all-img");
                        img.src = url;
                        
                        viewall_container.appendChild(img);
                    });
                });
            });

            view_counter = 1;
        
        } else if (view_counter == 1) {

            $("#view-all-container").fadeOut(300);
            document.getElementById("view-all-container").innerHTML = " ";
            $("#home-page-canvas").fadeIn(400);

            view_counter = 0;
        }
    });

    $("#confirm-img-button").on("click", function() {

        setTimeout(function() {

            document.getElementById("loading-page").appendChild(renderer.domElement);
        }, 1000);

        var model = new mi.ArbitraryStyleTransferNetwork();

        function stylize() {

            model.stylize(base1, base2).then((image_data) => {

                final_img.getContext("2d").putImageData(image_data, 0, 0);
                var data_actual = final_img.toDataURL("image/png");
                sessionStorage.setItem("img_url", data_actual);

                $("#loading-page").delay(2000).fadeOut();

                setTimeout(() => {

                    document.getElementById("loading-page").removeChild(renderer.domElement);

                    load_icon.material.map = new THREE.ImageUtils.loadTexture(data_actual);
                    load_icon.material.needsUpdate = true;

                    load_icon.geometry.dispose();
                    load_icon.geometry = new THREE.BoxGeometry(5, 5, 5, 30, 30, 30);

                    document.getElementById("final-img-container").appendChild(renderer.domElement);
                    var download_button = document.getElementById("download-button");
                    download_button.setAttribute("href", data_actual);
                    download_button.setAttribute("download", sessionStorage.getItem("img_url"));
                    
                    var controls = new THREE.OrbitControls(camera, renderer.domElement);
                }, 2000);

                $("#final-img-container").delay(1500).fadeIn();

                var ref = firebase.storage().ref("generated-images");

                final_img.toBlob(function(blob) {

                    var img = new Image();
                    img.src = blob;
                    
                    var task = ref.child(Date.now().toString()).put(blob);

                    task
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then(url => {
            
                        console.log(url);
                    
                    }).catch((error) => {
                    
                        console.error(error);
                    });
                });
            });
        }

        init();
        animate();
        $("#loading-page").fadeIn();

        setInterval(function() {

            $("#loading-page h2").fadeIn();
            $("#loading-page h2").fadeOut();

        }, 800);

        setTimeout(() => {
            model.initialize().then(stylize)
        }, 2000);
    });

    document.getElementById("download-button").onmousedown = function() {

       location.reload();
    }
});

//image functions
function home_page_images() {

    document.querySelectorAll(".home-page-images").forEach(item => {

        item.addEventListener("click", e => {
    
            var preview = document.createElement("img");
            preview.src = e.target.src;
            preview.id = "preview-element";

            document.getElementById("img-preview").appendChild(preview);
            $("#img-preview img").fadeIn();

            preview.onmousedown = function() {
                
                $(this).fadeOut();
                document.getElementById("img-preview").removeChild(preview);
            }
        });
    });
}

setTimeout(function() {

    home_page_images();
}, 1500);




