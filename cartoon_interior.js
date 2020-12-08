import b4w from "blend4web";

var m_app       = b4w.app;
var m_cam       = b4w.camera;
var m_cfg       = b4w.config;
var m_cont      = b4w.container;
var m_ctl       = b4w.controls;
var m_data      = b4w.data;
var m_mouse     = b4w.mouse;
var m_math      = b4w.math;
var m_obj       = b4w.objects;
var m_phy       = b4w.physics;
var m_preloader = b4w.preloader;
var m_scenes    = b4w.scenes;
var m_trans     = b4w.transform;
var m_version   = b4w.version;
var m_geom      = b4w.geometry;
var m_tex     = b4w.textures;

var m_quat = b4w.quat;

var DEBUG = (m_version.type() === "DEBUG");

var OUTLINE_COLOR_VALID = [0, 1, 0];
var OUTLINE_COLOR_ERROR = [1, 0, 0];
var FLOOR_PLANE_NORMAL = [0, 0, 1];

var ROT_ANGLE = Math.PI/4;

var WALL_X_MAX = 1.2;
var WALL_X_MIN = -3.8;
var WALL_Y_MAX = 0.8;
var WALL_Y_MIN = -4.2;
var APP_ASSETS_PATH = m_cfg.get_assets_path("kreator_lazienki2");

var ASSETS_PATH = APP_ASSETS_PATH;
var TEX_ASSETS_PATH = APP_ASSETS_PATH + "textures/";

var _obj_delta_xy = new Float32Array(2);
var spawner_pos = new Float32Array(3);
var _vec3_tmp = new Float32Array(3);
var _vec3_tmp2 = new Float32Array(3);
var _vec3_tmp3 = new Float32Array(3);
var _vec4_tmp = new Float32Array(4);

var _pline_tmp = m_math.create_pline();
var firstWallCordVec3 = new Float32Array(3);
var secondWallCordVec3 = new Float32Array(3);
var thirdWallCordVec3 = new Float32Array(3);
var fourthWallCordVec3 = new Float32Array(3);
var ArrowX1Vec3 = new Float32Array(3);
var ArrowX2Vec3 = new Float32Array(3);
var ArrowY1Vec3 = new Float32Array(3);
var ArrowY2Vec3 = new Float32Array(3);
var tempVec3Corner = new Float32Array(3);
var tempVec3Arrows = new Float32Array(3);
var tempVec3Numbers = new Float32Array(3);
var tempVec3HideNumbers = new Float32Array(3);
var distanceX1;
var distanceX2;
var distanceY1;
var distanceY2;

var arrowX1Object;
var arrowX2Object;
var arrowY1Object;
var arrowY2Object; 



var numbers= ["Zero","One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight","Nine"];
var numbersX1=[];
var numbersX1Tenth= [];
var numbersX1Hundreds=[];
var numbersY1=[];
var numbersY1Tenth= [];
var numbersY1Hundreds=[];
var numbersX2=[];
var numbersX2Tenth= [];
var numbersX2Hundreds=[];
var numbersY2=[];
var numbersY2Tenth= [];
var numbersY2Hundreds=[];


var HEIGHT_OF_WINDOW = 0.8;

var _drag_mode = false;
var _enable_camera_controls = true;

var _selected_obj = null;

var _textures = [];

var isClearView=false;

var wallNumberSticky =1;

var tempTexture = {
    FloorColor: 0,
    FloorNormal: 1,
    pierwszaScianaColor: 12,
    pierwszaScianaNormal: 13,
    drugaScianaColor: 12,
    drugaScianaNormal: 13,
    trzeciaScianaColor: 12,
    trzeciaScianaNormal: 13,
    czwartaScianaColor: 12,
    czwartaScianaNormal: 13,
};


export function init() {
    var show_fps = DEBUG;

    var url_params = m_app.get_url_params();

    if (url_params && "show_fps" in url_params)
        show_fps = true;

    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        physics_enabled: true,
        show_fps: show_fps,
        alpha: false,
        assets_dds_available: !DEBUG,
        assets_min50_available: !DEBUG,
        console_verbose: DEBUG,
        background_color: [1.0, 1.0, 1.0, 0.0]
    });
};

function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

    m_preloader.create_preloader();

    canvas_elem.addEventListener("mousedown", main_canvas_down);
    canvas_elem.addEventListener("touchstart", main_canvas_down);

    canvas_elem.addEventListener("mouseup", main_canvas_up);
    canvas_elem.addEventListener("touchend", main_canvas_up);

    canvas_elem.addEventListener("mousemove", main_canvas_move);
    canvas_elem.addEventListener("touchmove", main_canvas_move);

    window.onresize = m_cont.resize_to_container;
    m_cont.resize_to_container();
    load();
}

function preloader_cb(percentage) {
    m_preloader.update_preloader(percentage);
}

function load() {
    m_data.load(ASSETS_PATH + "environment.json", load_cb, preloader_cb);
}

function load_cb(data_id) {
    //m_app.enable_camera_controls(false, false, false, m_cont.get_canvas());
    m_app.enable_camera_controls(false, false, false, null, true);
    init_controls();

    var spawner = m_scenes.get_object_by_name("spawner");
    m_trans.get_translation(spawner, spawner_pos);

    //texture swap feature
    var tex_names = ["floor-default-basecolor.jpg",
                    "floor-default-normal.jpg",
                    "floor-option1-basecolor.jpg",
                    "floor-option1-normal.png",
                    "floor-option2-basecolor.jpg",
                    "floor-option2-normal.jpg",
                    "floor-option3-basecolor.jpg",
                    "floor-option3-normal.jpg",
                    "floor-option4-basecolor.jpg",
                    "floor-option4-normal.jpg",
                    "floor-option5-basecolor.jpg",
                    "floor-option5-normal.jpg",
                    "wall-default-basecolor.jpg", //12
                    "wall-default-normal.jpg", //13
                    "wall-option1-basecolor.jpg",
                    "wall-option1-normal.jpg",
                    "wall-option2-basecolor.jpg",
                    "wall-option2-normal.jpg",
                    "wall-option3-basecolor.jpg",
                    "wall-option3-normal.jpg",
                    "wall-option4-basecolor.jpg",
                    "wall-option4-normal.jpg",
                    "wall-option5-basecolor.jpg",
                    "wall-option5-normal.jpg"];
    for (var i = 0; i < tex_names.length; i++) {
        var tex = new Image();
        tex.src = TEX_ASSETS_PATH + tex_names[i];
        _textures.push(tex)
    }
     arrowX1Object = m_scenes.get_object_by_name("ArrowX1");
     arrowX2Object = m_scenes.get_object_by_name("ArrowX2");
     arrowY1Object = m_scenes.get_object_by_name("ArrowY1");
     arrowY2Object = m_scenes.get_object_by_name("ArrowY2");
    

    for (var i = 0; i < numbers.length; i++) {
        var name = "x1"+numbers[i];
        var temp = m_scenes.get_object_by_name(name);
        numbersX1.push(temp);

        name = "x1Tenth"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersX1Tenth.push(temp);

        name = "x1Hundreds"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersX1Hundreds.push(temp);

        name = "x2"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersX2.push(temp);

        name = "x2Tenth"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersX2Tenth.push(temp);

        name = "x2Hundreds"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersX2Hundreds.push(temp);

        name = "y2"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersY2.push(temp);

        name = "y2Tenth"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersY2Tenth.push(temp);

        name = "y2Hundreds"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersY2Hundreds.push(temp);

        name = "y1"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersY1.push(temp);

        name = "y1Tenth"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersY1Tenth.push(temp);

        name = "y1Hundreds"+numbers[i];
        temp = m_scenes.get_object_by_name(name);
        numbersY1Hundreds.push(temp);
        
    }

}

function init_controls() {
    var controls_elem = document.getElementById("controls-container");
    controls_elem.style.display = "block";

    init_buttons();
    
    //hide outline of objects on init
    var objs = m_scenes.get_all_objects("MESH");
        for (var i = 0; i < objs.length; i++) {
        var objectName = m_scenes.get_object_name(objs[i]);
            if(objectName.includes("Outline")){
                m_scenes.hide_object(objs[i]); 
            }
    }


    document.getElementById("clearViewToogle").addEventListener("click", function(e) {
        var objs = m_scenes.get_all_objects("MESH");
        for (var i = 0; i < objs.length; i++) {
            var objectName = m_scenes.get_object_name(objs[i]);
            if(objectName.includes("Outline")){
                if(isClearView){
                    m_scenes.hide_object(objs[i]); 
                }
                else{
                    m_scenes.show_object(objs[i]);
                }
            }
            var tempColor = objectName + "Color";
            var tempNormal = objectName  + "Normal";
            if(tempTexture.hasOwnProperty(tempColor)){
                var selectedObject = m_scenes.get_object_by_name(objectName);
                var selectedObjectTextureColor = "";
                var selectedObjectTextureNormal = "";
                var selectedObjectTextureArray = m_tex.get_texture_names(objs[i]);
                if(selectedObjectTextureArray[0].includes("basecolor")){
                    selectedObjectTextureColor = selectedObjectTextureArray[0];
                    selectedObjectTextureNormal = selectedObjectTextureArray[1];
                }
                else if(selectedObjectTextureArray[0].includes("normal")){
                    selectedObjectTextureColor = selectedObjectTextureArray[1];
                    selectedObjectTextureNormal = selectedObjectTextureArray[0];
                }
                if(isClearView){
                    m_tex.replace_image(selectedObject,selectedObjectTextureColor,_textures[tempTexture[tempColor]]);
                    m_tex.replace_image(selectedObject,selectedObjectTextureNormal,_textures[tempTexture[tempNormal]]);
                }
                else{
                    var tex = new Image();
                    tex.src = TEX_ASSETS_PATH + "white.png";
                    var normal = new Image();
                    normal.src = TEX_ASSETS_PATH + "white.png";
                    m_tex.replace_image(selectedObject,selectedObjectTextureColor,tex);
                    m_tex.replace_image(selectedObject,selectedObjectTextureNormal,normal);
                }
            }
        }
        if(isClearView){
            isClearView = false;
        }
        else{
            isClearView = true;
        }
    });

    document.getElementById("load-1").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "Cube.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-2").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "door.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-3").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "window.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-4").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "tub.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-5").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "tub2.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-6").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "tub3.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-7").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "shower.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-8").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "shower2.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-9").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "shower3.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-10").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "sink.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-11").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "sink2.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-12").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "sink3.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-13").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "heater.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-14").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "heater2.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-15").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "heater3.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-16").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "toilet.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-17").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "toilet2.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-18").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "toilet3.json", loaded_cb, null, null, true);
    });
    document.getElementById("load-19").addEventListener("click", function(e) {
        m_data.load(ASSETS_PATH + "washingMachine.json", loaded_cb, null, null, true);
    });
    //floor textures
    document.getElementById("floor-material-default").addEventListener("click", function(e) {
        var floor = m_scenes.get_object_by_name("Floor");
        m_tex.replace_image(floor,"floor-basecolor",_textures[0]);
        m_tex.replace_image(floor,"floor-normal",_textures[1]);
        tempTexture.FloorColor=0;
        tempTexture.FloorNormal=1;
    });
    document.getElementById("floor-material-1").addEventListener("click", function(e) {
        var floor = m_scenes.get_object_by_name("Floor");
        m_tex.replace_image(floor,"floor-basecolor",_textures[2]);
        m_tex.replace_image(floor,"floor-normal",_textures[3]);
        tempTexture.FloorColor=2;
        tempTexture.FloorNormal=3;
    });
    document.getElementById("floor-material-2").addEventListener("click", function(e) {
        var floor = m_scenes.get_object_by_name("Floor");
        m_tex.replace_image(floor,"floor-basecolor",_textures[4]);
        m_tex.replace_image(floor,"floor-normal",_textures[5]);
        tempTexture.FloorColor=4;
        tempTexture.FloorNormal=5;
    });
    document.getElementById("floor-material-3").addEventListener("click", function(e) {
        var floor = m_scenes.get_object_by_name("Floor");
        m_tex.replace_image(floor,"floor-basecolor",_textures[6]);
        m_tex.replace_image(floor,"floor-normal",_textures[7]);
        tempTexture.FloorColor=6;
        tempTexture.FloorNormal=7;
    });
    document.getElementById("floor-material-4").addEventListener("click", function(e) {
        var floor = m_scenes.get_object_by_name("Floor");
        m_tex.replace_image(floor,"floor-basecolor",_textures[8]);
        m_tex.replace_image(floor,"floor-normal",_textures[9]);
        tempTexture.FloorColor=8;
        tempTexture.FloorNormal=9;
    });
    document.getElementById("floor-material-5").addEventListener("click", function(e) {
        var floor = m_scenes.get_object_by_name("Floor");
        m_tex.replace_image(floor,"floor-basecolor",_textures[10]);
        m_tex.replace_image(floor,"floor-normal",_textures[11]);
        tempTexture.FloorColor=10;
        tempTexture.FloorNormal=11;
    });
    //wall textures
    var walls=[];
    walls.push(m_scenes.get_object_by_name("pierwszaSciana"));
    walls.push(m_scenes.get_object_by_name("drugaSciana"));
    walls.push(m_scenes.get_object_by_name("trzeciaSciana"));
    walls.push(m_scenes.get_object_by_name("czwartaSciana"));

    document.getElementById("wall-material-default").addEventListener("click", function(e) {
        for(var i = 0; i < walls.length; i++) {
            m_tex.replace_image(walls[i],"wall-basecolor",_textures[12]);
            m_tex.replace_image(walls[i],"wall-normal",_textures[13]);
            tempTexture.pierwszaScianaColor = 12;
            tempTexture.pierwszaScianaNormal = 13;
            tempTexture.drugaScianaColor = 12;
            tempTexture.drugaScianaNormal = 13;
            tempTexture.trzeciaScianaColor = 12;
            tempTexture.trzeciaScianaNormal = 13;
            tempTexture.czwartaScianaColor = 12;
            tempTexture.czwartaScianaNormal = 13;
        }
    });
    document.getElementById("wall-material-1").addEventListener("click", function(e) {
        for(var i = 0; i < walls.length; i++) {
            m_tex.replace_image(walls[i],"wall-basecolor",_textures[14]);
            m_tex.replace_image(walls[i],"wall-normal",_textures[15]);
            tempTexture.pierwszaScianaColor = 14;
            tempTexture.pierwszaScianaNormal = 15;
            tempTexture.drugaScianaColor = 14;
            tempTexture.drugaScianaNormal = 15;
            tempTexture.trzeciaScianaColor = 14;
            tempTexture.trzeciaScianaNormal = 15;
            tempTexture.czwartaScianaColor = 14;
            tempTexture.czwartaScianaNormal = 15;
        }
    });
    document.getElementById("wall-material-2").addEventListener("click", function(e) {
        for(var i = 0; i < walls.length; i++) {
            m_tex.replace_image(walls[i],"wall-basecolor",_textures[16]);
            m_tex.replace_image(walls[i],"wall-normal",_textures[17]);
            tempTexture.pierwszaScianaColor = 16;
            tempTexture.pierwszaScianaNormal = 17;
            tempTexture.drugaScianaColor = 16;
            tempTexture.drugaScianaNormal = 17;
            tempTexture.trzeciaScianaColor = 16;
            tempTexture.trzeciaScianaNormal = 17;
            tempTexture.czwartaScianaColor = 16;
            tempTexture.czwartaScianaNormal = 17;
        }
    });
    document.getElementById("wall-material-3").addEventListener("click", function(e) {
        for(var i = 0; i < walls.length; i++) {
            m_tex.replace_image(walls[i],"wall-basecolor",_textures[18]);
            m_tex.replace_image(walls[i],"wall-normal",_textures[19]);
            tempTexture.pierwszaScianaColor = 18;
            tempTexture.pierwszaScianaNormal = 19;
            tempTexture.drugaScianaColor = 18;
            tempTexture.drugaScianaNormal = 19;
            tempTexture.trzeciaScianaColor = 18;
            tempTexture.trzeciaScianaNormal = 19;
            tempTexture.czwartaScianaColor = 18;
            tempTexture.czwartaScianaNormal = 19;
        }
    });
    document.getElementById("wall-material-4").addEventListener("click", function(e) {
        for(var i = 0; i < walls.length; i++) {
            m_tex.replace_image(walls[i],"wall-basecolor",_textures[20]);
            m_tex.replace_image(walls[i],"wall-normal",_textures[21]);
            tempTexture.pierwszaScianaColor = 20;
            tempTexture.pierwszaScianaNormal = 21;
            tempTexture.drugaScianaColor = 20;
            tempTexture.drugaScianaNormal = 21;
            tempTexture.trzeciaScianaColor = 20;
            tempTexture.trzeciaScianaNormal = 21;
            tempTexture.czwartaScianaColor = 20;
            tempTexture.czwartaScianaNormal = 21;
        }
    });
    document.getElementById("wall-material-5").addEventListener("click", function(e) {
        for(var i = 0; i < walls.length; i++) {
            m_tex.replace_image(walls[i],"wall-basecolor",_textures[22]);
            m_tex.replace_image(walls[i],"wall-normal",_textures[23]);
            tempTexture.pierwszaScianaColor = 22;
            tempTexture.pierwszaScianaNormal = 23;
            tempTexture.drugaScianaColor = 22;
            tempTexture.drugaScianaNormal = 23;
            tempTexture.trzeciaScianaColor = 22;
            tempTexture.trzeciaScianaNormal = 23;
            tempTexture.czwartaScianaColor = 22;
            tempTexture.czwartaScianaNormal = 23;
        }
    });

    document.getElementById("delete").addEventListener("click", function(e) {
        if (_selected_obj) {
            var id = m_scenes.get_object_data_id(_selected_obj);
            m_data.unload(id);
            _selected_obj = null;
        }
    });
    document.getElementById("rot-ccw").addEventListener("click", function(e) {
        if (_selected_obj)
            rotate_object(_selected_obj, ROT_ANGLE);
    });
    document.getElementById("rot-cw").addEventListener("click", function(e) {
        if (_selected_obj)
            rotate_object(_selected_obj, -ROT_ANGLE);
    });
    
initWallControls();

}

function init_buttons() {
    var ids = ["delete", "rot-ccw", "rot-cw"];

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];

        document.getElementById(id).addEventListener("mousedown", function(e) {
            var parent = e.target.parentNode;
            parent.classList.add("active");
        });
        document.getElementById(id).addEventListener("mouseup", function(e) {
            var parent = e.target.parentNode;
            parent.classList.remove("active");
        });
        document.getElementById(id).addEventListener("touchstart", function(e) {
            var parent = e.target.parentNode;
            parent.classList.add("active");
        });
        document.getElementById(id).addEventListener("touchend", function(e) {
            var parent = e.target.parentNode;
            parent.classList.remove("active");
        });
    }
}

function loaded_cb(data_id) {

    var objs = m_scenes.get_all_objects("ALL", data_id);
    for (var i = 0; i < objs.length; i++) {
        var obj = objs[i];

        if (m_phy.has_physics(obj)) {
            m_phy.enable_simulation(obj);

            // create sensors to detect collisions
            var sensor_col = m_ctl.create_collision_sensor(obj, "FURNITURE");
            var sensor_sel = m_ctl.create_selection_sensor(obj, true);

            if (obj == _selected_obj)
                m_ctl.set_custom_sensor(sensor_sel, 1);

            m_ctl.create_sensor_manifold(obj, "COLLISION", m_ctl.CT_CONTINUOUS, 
                    [sensor_col, sensor_sel], logic_func, trigger_outline);


            // spawn appended object at a certain position
            var obj_parent = m_obj.get_parent(obj);
            if (obj_parent && m_obj.is_armature(obj_parent))
                // translate the parent (armature) of the animated object
                m_trans.set_translation_v(obj_parent, spawner_pos);
            else
                m_trans.set_translation_v(obj, spawner_pos);
        }

        var objectName = m_scenes.get_object_name(obj);
        var objectPosition = new Float32Array(3);
        var spawner = m_scenes.get_object_by_name("spawner");
        m_trans.get_translation(spawner, objectPosition);
        objectPosition[2]+=HEIGHT_OF_WINDOW;
        if(objectName.includes("Bottom")){
            m_trans.set_translation_v(obj,objectPosition);
        }

        // show appended object
        if (m_obj.is_mesh(obj))
            m_scenes.show_object(obj);
        
         //hide outline of objects on init
        var objectName = m_scenes.get_object_name(objs[i]);
            if(objectName.includes("Outline")){
                m_scenes.hide_object(objs[i]); 
            }

        
    }
    
    
   
    
}

function logic_func(s) {
    return s[1];
}

function trigger_outline(obj, id, pulse) {
    if (pulse == 1) {
        // change outline color according to the  
        // first manifold sensor (collision sensor) status
        var has_collision = m_ctl.get_sensor_value(obj, id, 0);
        if (has_collision)
            m_scenes.set_outline_color(OUTLINE_COLOR_ERROR);
        else
            m_scenes.set_outline_color(OUTLINE_COLOR_VALID);
    }
}

function rotate_object(obj, angle) {
    var obj_parent = m_obj.get_parent(obj);
    
    if (obj_parent && m_obj.is_armature(obj_parent)) {
        // rotate the parent (armature) of the animated object
        var obj_quat = m_trans.get_rotation(obj_parent, _vec4_tmp);
        m_quat.rotateZ(obj_quat, angle, obj_quat);
        m_trans.set_rotation_v(obj_parent, obj_quat);
    } else {
        var obj_quat = m_trans.get_rotation(obj, _vec4_tmp);
        m_quat.rotateZ(obj_quat, angle, obj_quat);
        m_trans.set_rotation_v(obj, obj_quat);
    }
    m_obj.update_boundings(obj);
    var firstWallCordObject = m_scenes.get_object_by_name("firstWallCord");
    var secondWallCordObject = m_scenes.get_object_by_name("secondWallCord");
    var thirdWallCordObject = m_scenes.get_object_by_name("thirdWallCord");
    var fourthWallCordObject = m_scenes.get_object_by_name("fourthWallCord");
    
    objectCoordinatesDistance(obj);

    limit_object_position(obj,firstWallCordObject,secondWallCordObject,thirdWallCordObject,fourthWallCordObject);
}

function main_canvas_down(e) {
    _drag_mode = true;

    if (e.preventDefault)
        e.preventDefault();

    var x = m_mouse.get_coords_x(e);
    var y = m_mouse.get_coords_y(e);
    

    var obj = m_scenes.pick_object(x, y);

    // handling outline effect
    if (_selected_obj != obj) {
        if (_selected_obj){
            m_scenes.clear_outline_anim(_selected_obj);
            var windowHeightInput = document.getElementById("heightOfWindowContainer");
            var doorWidthInput = document.getElementById("doorWidthContainer");
            windowHeightInput.classList.remove("show-hidden-container");
            doorWidthInput.classList.remove("show-hidden-container");
        }
            
        if (obj){
            m_scenes.apply_outline_anim(obj, 1, 1, 0);
        }
            

        _selected_obj = obj;
    }

    // calculate delta in viewport coordinates
    if (_selected_obj) {
        var cam = m_scenes.get_active_camera();

        var obj_parent = m_obj.get_parent(_selected_obj);
        if (obj_parent && m_obj.is_armature(obj_parent))
            // get translation from the parent (armature) of the animated object
            m_trans.get_translation(obj_parent, _vec3_tmp);
        else
            m_trans.get_translation(_selected_obj, _vec3_tmp);
        m_cam.project_point(cam, _vec3_tmp, _obj_delta_xy);

        _obj_delta_xy[0] = x - _obj_delta_xy[0];
        _obj_delta_xy[1] = y - _obj_delta_xy[1];
    }
    //main_canvas_move(e);
    var objectName;
    if (_selected_obj) {
    objectCoordinatesDistance(_selected_obj);
    objectName = m_scenes.get_object_name(obj);
    }
    if(objectName) {
        if(objectName.includes("Bottom")) {
            var windowHeightInput = document.getElementById("heightOfWindowContainer");
            var doorWidthInput = document.getElementById("doorWidthContainer");
            windowHeightInput.classList.add("show-hidden-container");
            doorWidthInput.classList.remove("show-hidden-container");

        }
        else if(objectName.includes("Door")) {
            var windowHeightInput = document.getElementById("heightOfWindowContainer");
            var doorWidthInput = document.getElementById("doorWidthContainer");
            doorWidthInput.classList.add("show-hidden-container");

            windowHeightInput.classList.remove("show-hidden-container");

        }
        else{
            var windowHeightInput = document.getElementById("heightOfWindowContainer");
            var doorWidthInput = document.getElementById("doorWidthContainer");
            doorWidthInput.classList.remove("show-hidden-container");
            windowHeightInput.classList.remove("show-hidden-container");

        }
    }
    
}

function main_canvas_up(e) {
    _drag_mode = false;
    // enable camera controls after releasing the object
    if (!_enable_camera_controls) {
        m_app.enable_camera_controls();
        _enable_camera_controls = true;
    }
}

function main_canvas_move(e) {
    if (_drag_mode)
        if (_selected_obj) {
            // disable camera controls while moving the object
            if (_enable_camera_controls) {
                m_app.disable_camera_controls();
                _enable_camera_controls = false;
            }

            // calculate viewport coordinates
            var cam = m_scenes.get_active_camera();

            var x = m_mouse.get_coords_x(e);
            var y = m_mouse.get_coords_y(e);
           
            if (x >= 0 && y >= 0) {
                x -= _obj_delta_xy[0];
                y -= _obj_delta_xy[1];
                

                // emit ray from the camera
                var pline = m_cam.calc_ray(cam, x, y, _pline_tmp);
                var camera_ray = m_math.get_pline_directional_vec(pline, _vec3_tmp);

                // calculate ray/floor_plane intersection point
                var cam_trans = m_trans.get_translation(cam, _vec3_tmp2);
                m_math.set_pline_initial_point(_pline_tmp, cam_trans);
                m_math.set_pline_directional_vec(_pline_tmp, camera_ray);
                var point = m_math.line_plane_intersect(FLOOR_PLANE_NORMAL, 0,
                        _pline_tmp, _vec3_tmp3);
                
                var firstWallCordObject = m_scenes.get_object_by_name("firstWallCord");
                var secondWallCordObject = m_scenes.get_object_by_name("secondWallCord");
                var thirdWallCordObject = m_scenes.get_object_by_name("thirdWallCord");
                var fourthWallCordObject = m_scenes.get_object_by_name("fourthWallCord");

               
                
                firstWallCordVec3 = point.slice();
                secondWallCordVec3 = point.slice();
                thirdWallCordVec3 = point.slice();
                fourthWallCordVec3 = point.slice();
                
                
                firstWallCordVec3[0]=-3.8;
                secondWallCordVec3[1]=WALL_Y_MAX;
                thirdWallCordVec3[0]=WALL_X_MAX;
                fourthWallCordVec3[1]=-4.2;
                
                var objectName = m_scenes.get_object_name(_selected_obj);
                if(objectName.includes("Bottom")){
                    var objectPosition = new Float32Array(3);
                    objectPosition=  m_trans.get_translation(_selected_obj);
                    HEIGHT_OF_WINDOW=objectPosition[2];
                    var windowHeightInput = document.getElementById("heightOfWindow");
                    var centimeter = HEIGHT_OF_WINDOW*100;
                    var fixed2 = parseInt(centimeter,10);
                    windowHeightInput.value = fixed2;
                }
                

                if (point && camera_ray[2] < 0) {
                    var obj_parent = m_obj.get_parent(_selected_obj);
                    if (obj_parent && m_obj.is_armature(obj_parent))
                        // translate the parent (armature) of the animated object
                        m_trans.set_translation_v(obj_parent, point);
                    else{
                        m_trans.set_translation_v(_selected_obj, point);
                        m_trans.set_translation_v(firstWallCordObject, firstWallCordVec3);
                        m_trans.set_translation_v(secondWallCordObject, secondWallCordVec3);
                        m_trans.set_translation_v(thirdWallCordObject, thirdWallCordVec3);
                        m_trans.set_translation_v(fourthWallCordObject, fourthWallCordVec3);
                    }
                    
                    limit_object_position(_selected_obj,firstWallCordObject,secondWallCordObject,thirdWallCordObject,fourthWallCordObject);
                    //limit_object_position(firstWallCordObject);
                    //limit_object_position(secondWallCordObject);
                    //limit_object_position(thirdWallCordObject);
                    //limit_object_position(fourthWallCordObject);
                }
            }
            objectCoordinatesDistance(_selected_obj);
        }
}

function limit_object_position(obj,firstWallCordObject,secondWallCordObject,thirdWallCordObject,fourthWallCordObject) {
    var id = m_scenes.get_object_data_id(_selected_obj);
    var objectName = m_scenes.get_object_name(obj);
    var firstCornerCordObject = m_scenes.get_object_by_name("firstCornerCord",id);
    var secondCornerCordObject = m_scenes.get_object_by_name("secondCornerCord",id);
    var thirdCornerCordObject = m_scenes.get_object_by_name("thirdCornerCord",id);
    var fourthCornerCordObject = m_scenes.get_object_by_name("fourthCornerCord",id);
    var firstCordObject = m_scenes.get_object_by_name("firstCord",id);
    var secondCordObject = m_scenes.get_object_by_name("secondCord",id);
    var thirdCordObject = m_scenes.get_object_by_name("thirdCord",id);
    var fourthCordObject = m_scenes.get_object_by_name("fourthCord",id);

    var firstCordObjectCalculation = m_scenes.get_object_by_name("firstCord",id);
    var secondCordObjectCalculation = m_scenes.get_object_by_name("secondCord",id);
    var thirdCordObjectCalculation = m_scenes.get_object_by_name("thirdCord",id);
    var fourthCordObjectCalculation = m_scenes.get_object_by_name("fourthCord",id);


    var currentRotation = m_trans.get_rotation(_selected_obj);
    var rotationResult =currentRotation[2].toFixed(2); 
    switch(true) {
        case rotationResult>-0.1&&rotationResult<0.1:
            firstCordObject = m_scenes.get_object_by_name("firstCord",id);
            secondCordObject = m_scenes.get_object_by_name("secondCord",id);
            thirdCordObject = m_scenes.get_object_by_name("thirdCord",id);
            fourthCordObject = m_scenes.get_object_by_name("fourthCord",id);
            break;
        case rotationResult>-0.4&&rotationResult<-0.3:
            firstCordObject = m_scenes.get_object_by_name("firstCornerCord",id);
            secondCordObject = m_scenes.get_object_by_name("secondCornerCord",id);
            thirdCordObject = m_scenes.get_object_by_name("thirdCornerCord",id);
            fourthCordObject = m_scenes.get_object_by_name("fourthCornerCord",id);
            break;
        case rotationResult>-0.8&&rotationResult<-0.6:
            firstCordObject = m_scenes.get_object_by_name("fourthCord",id);
            secondCordObject = m_scenes.get_object_by_name("firstCord",id);
            thirdCordObject = m_scenes.get_object_by_name("secondCord",id);
            fourthCordObject = m_scenes.get_object_by_name("thirdCord",id);
            break;
        case rotationResult>-0.95&&rotationResult<-0.9:
            firstCordObject = m_scenes.get_object_by_name("fourthCornerCord",id);
            secondCordObject = m_scenes.get_object_by_name("firstCornerCord",id);
            thirdCordObject = m_scenes.get_object_by_name("secondCornerCord",id);
            fourthCordObject = m_scenes.get_object_by_name("thirdCornerCord",id);
            break;
        case rotationResult>-1.05&&rotationResult<-0.95:
            firstCordObject = m_scenes.get_object_by_name("thirdCord",id);
            secondCordObject = m_scenes.get_object_by_name("fourthCord",id);
            thirdCordObject = m_scenes.get_object_by_name("firstCord",id);
            fourthCordObject = m_scenes.get_object_by_name("secondCord",id);
            break;
        case rotationResult>0.3&&rotationResult<0.4:
            firstCordObject = m_scenes.get_object_by_name("secondCornerCord",id);
            secondCordObject = m_scenes.get_object_by_name("thirdCornerCord",id);
            thirdCordObject = m_scenes.get_object_by_name("fourthCornerCord",id);
            fourthCordObject = m_scenes.get_object_by_name("firstCornerCord",id);
            break;
        case rotationResult>0.6&&rotationResult<0.8:
            firstCordObject = m_scenes.get_object_by_name("secondCord",id);
            secondCordObject = m_scenes.get_object_by_name("thirdCord",id);
            thirdCordObject = m_scenes.get_object_by_name("fourthCord",id);
            fourthCordObject = m_scenes.get_object_by_name("firstCord",id);
            break;
        case rotationResult>0.9&&rotationResult<0.95:
            firstCordObject = m_scenes.get_object_by_name("thirdCornerCord",id);
            secondCordObject = m_scenes.get_object_by_name("fourthCornerCord",id);
            thirdCordObject = m_scenes.get_object_by_name("firstCornerCord",id);
            fourthCordObject = m_scenes.get_object_by_name("secondCornerCord",id);
            break;
        case rotationResult>0.95&&rotationResult<1.05:
            firstCordObject = m_scenes.get_object_by_name("thirdCord",id);
            secondCordObject = m_scenes.get_object_by_name("fourthCord",id);
            thirdCordObject = m_scenes.get_object_by_name("firstCord",id);
            fourthCordObject = m_scenes.get_object_by_name("secondCord",id);
            break;
            
        default:
           // console.log(rotationResult);
    }





    m_trans.get_translation(firstCordObject, ArrowX1Vec3);
    m_trans.get_translation(thirdCordObject, ArrowX2Vec3);
    m_trans.get_translation(secondCordObject, ArrowY1Vec3);
    m_trans.get_translation(fourthCordObject, ArrowY2Vec3);
    ArrowX1Vec3[0]=ArrowX1Vec3[0] - 0.5;
    ArrowX2Vec3[0]=ArrowX2Vec3[0] + 0.5;
    ArrowY1Vec3[1]=ArrowY1Vec3[1] + 0.5;
    ArrowY2Vec3[1]=ArrowY2Vec3[1] - 0.5;
    ArrowX1Vec3[2]=0.01;
    ArrowX2Vec3[2]=0.01;
    ArrowY1Vec3[2]=0.01;
    ArrowY2Vec3[2]=0.01;
    var hideZ=1000;
    m_obj.update_boundings(obj);
    var bb = m_trans.get_object_bounding_box(obj);

    var obj_parent = m_obj.get_parent(obj);
    if (obj_parent && m_obj.is_armature(obj_parent))
        // get translation from the parent (armature) of the animated object
        var obj_pos = m_trans.get_translation(obj_parent, _vec3_tmp);
    else
        var obj_pos = m_trans.get_translation(obj, _vec3_tmp);

        if(objectName.includes("Bottom")){
            obj_pos[2]=HEIGHT_OF_WINDOW;
        }

    if (bb.max_x > WALL_X_MAX){
        obj_pos[0] -= bb.max_x - WALL_X_MAX;
        ArrowX2Vec3[2]=hideZ;
        // ArrowX1Vec3[0]=obj_pos[0] - bb.max_x+bb.min_x;
        // ArrowY2Vec3[0]=obj_pos[0];
        // ArrowY1Vec3[0]=obj_pos[0];
        wallNumberSticky=3;
        repositionArrowsOnRotatedObj(firstCordObject,secondCordObject,thirdCordObject,fourthCordObject);
    }
        
    else if (bb.min_x < WALL_X_MIN){
        obj_pos[0] += WALL_X_MIN - bb.min_x;
        ArrowX1Vec3[2]=hideZ;
        // ArrowX2Vec3[0]=obj_pos[0] + bb.max_x-bb.min_x;
        // ArrowY1Vec3[0]=obj_pos[0];
        // ArrowY2Vec3[0]=obj_pos[0];
        wallNumberSticky=1;
        repositionArrowsOnRotatedObj(firstCordObject,secondCordObject,thirdCordObject,fourthCordObject);

    }
        

    if (bb.max_y > WALL_Y_MAX){
        obj_pos[1] -= bb.max_y - WALL_Y_MAX;
        ArrowY1Vec3[2]=hideZ;
        // ArrowY2Vec3[1]=obj_pos[1] - bb.max_y+bb.min_y+0.5;
        // ArrowX1Vec3[1]=obj_pos[1];
        // ArrowX2Vec3[1]=obj_pos[1];
        wallNumberSticky=2;
        repositionArrowsOnRotatedObj(firstCordObject,secondCordObject,thirdCordObject,fourthCordObject);


    }
        
    else if (bb.min_y < WALL_Y_MIN){
        obj_pos[1] += WALL_Y_MIN - bb.min_y;
        ArrowY2Vec3[2]=hideZ;
        // ArrowY1Vec3[1]=obj_pos[1] + bb.max_y-bb.min_y-0.5;
        // ArrowX1Vec3[1]=obj_pos[1];
        // ArrowX2Vec3[1]=obj_pos[1];
        wallNumberSticky=4;
        repositionArrowsOnRotatedObj(firstCordObject,secondCordObject,thirdCordObject,fourthCordObject);

    }
        
    //----
    firstWallCordVec3 = obj_pos.slice();
    secondWallCordVec3 = obj_pos.slice();
    thirdWallCordVec3 = obj_pos.slice();
    fourthWallCordVec3 = obj_pos.slice();

    firstWallCordVec3[0]=-3.8;
    secondWallCordVec3[1]=WALL_Y_MAX;
    thirdWallCordVec3[0]=WALL_X_MAX;
    fourthWallCordVec3[1]=-4.2;

    
    

    //stickyToWalls
    
    if(objectName.includes("Sticky")){
        var obj_quat = m_trans.get_rotation(obj);
        var rotationResult =obj_quat[2].toFixed(2);
        if(wallNumberSticky==1){ 
            obj_pos[0]=-3.8;
            switch(true) {
                case rotationResult>-0.8&&rotationResult<-0.6:
                    m_quat.rotateZ(obj_quat, ROT_ANGLE*2, obj_quat);
                    m_trans.set_rotation_v(obj, obj_quat);
                    break;
                case rotationResult>0.6&&rotationResult<0.8:
                    m_quat.rotateZ(obj_quat, ROT_ANGLE*2, obj_quat);
                    m_trans.set_rotation_v(obj, obj_quat);
                    break;
                    
                default:
                    //console.log(rotationResult);
            }
            
            ArrowX1Vec3[2]=hideZ;
            ArrowX2Vec3[0]=obj_pos[0] + bb.max_x-bb.min_x+0.49;
            ArrowY1Vec3[0]=obj_pos[0];
            ArrowY2Vec3[0]=obj_pos[0];

            secondWallCordVec3[0]=-3.8;
            fourthWallCordVec3[0]=-3.8;
            
        }
        else if(wallNumberSticky==2){ 
            obj_pos[1]=WALL_Y_MAX;
            switch(true) {
                case rotationResult>-0.1&&rotationResult<0.1:
                    m_quat.rotateZ(obj_quat, ROT_ANGLE*2, obj_quat);
                    m_trans.set_rotation_v(obj, obj_quat);
                    break;
                case rotationResult>0.95&&rotationResult<1.05:
                    m_quat.rotateZ(obj_quat, ROT_ANGLE*2, obj_quat);
                    m_trans.set_rotation_v(obj, obj_quat);
                    break;
                    
                default:
                    //console.log(rotationResult);
            }

            ArrowY1Vec3[2]=hideZ;
            ArrowY2Vec3[1]=obj_pos[1] - bb.max_y+bb.min_y-0.49;
            ArrowX1Vec3[1]=obj_pos[1];
            ArrowX2Vec3[1]=obj_pos[1];

            firstWallCordVec3[1]=WALL_Y_MAX;
            thirdWallCordVec3[1]=WALL_Y_MAX;

        }
        else if(wallNumberSticky==3){ 
            obj_pos[0]=WALL_X_MAX;
            switch(true) {
                case rotationResult>-0.8&&rotationResult<-0.6:
                    m_quat.rotateZ(obj_quat, ROT_ANGLE*2, obj_quat);
                    m_trans.set_rotation_v(obj, obj_quat);
                    break;
                case rotationResult>0.6&&rotationResult<0.8:
                    m_quat.rotateZ(obj_quat, ROT_ANGLE*2, obj_quat);
                    m_trans.set_rotation_v(obj, obj_quat);
                    break;
                    
                default:
                    //console.log(rotationResult);
            }
            ArrowX2Vec3[2]=hideZ;
            ArrowX1Vec3[0]=obj_pos[0] - bb.max_x+bb.min_x-0.49;
            ArrowY2Vec3[0]=obj_pos[0];
            ArrowY1Vec3[0]=obj_pos[0];

            secondWallCordVec3[0]=WALL_X_MAX;
            fourthWallCordVec3[0]=WALL_X_MAX;

        }
        else if(wallNumberSticky==4){ 
            obj_pos[1]=-4.2;
            switch(true) {
                case rotationResult>-0.1&&rotationResult<0.1:
                    m_quat.rotateZ(obj_quat, ROT_ANGLE*2, obj_quat);
                    m_trans.set_rotation_v(obj, obj_quat);
                    break;
                case rotationResult>0.95&&rotationResult<1.05:
                    m_quat.rotateZ(obj_quat, ROT_ANGLE*2, obj_quat);
                    m_trans.set_rotation_v(obj, obj_quat);
                    break;
                    
                default:
                   //console.log(rotationResult);
            }
            ArrowY2Vec3[2]=hideZ;
            ArrowY1Vec3[1]=obj_pos[1] + bb.max_y-bb.min_y+0.49;
            ArrowX1Vec3[1]=obj_pos[1];
            ArrowX2Vec3[1]=obj_pos[1];

            firstWallCordVec3[1]=-4.2;
            thirdWallCordVec3[1]=-4.2;
        }
    }
    
    

    if (obj_parent && m_obj.is_armature(obj_parent))
        // translate the parent (armature) of the animated object
        m_trans.set_translation_v(obj_parent, obj_pos);
    else{
        m_trans.set_translation_v(obj, obj_pos);
        m_trans.set_translation_v(firstWallCordObject, firstWallCordVec3);
        m_trans.set_translation_v(secondWallCordObject, secondWallCordVec3);
        m_trans.set_translation_v(thirdWallCordObject, thirdWallCordVec3);
        m_trans.set_translation_v(fourthWallCordObject, fourthWallCordVec3);
        m_trans.set_translation_v(arrowX1Object, ArrowX1Vec3);
        m_trans.set_translation_v(arrowX2Object, ArrowX2Vec3);
        m_trans.set_translation_v(arrowY1Object, ArrowY1Vec3);
        m_trans.set_translation_v(arrowY2Object, ArrowY2Vec3);
        m_geom.set_shape_key_value(arrowX1Object, "length", (distanceX1-1));
        m_geom.set_shape_key_value(arrowX2Object, "length", (distanceX2-1));
        m_geom.set_shape_key_value(arrowY1Object, "length", (distanceY1-1));
        m_geom.set_shape_key_value(arrowY2Object, "length", (distanceY2-1));
        repositionArrowsOnRotatedObj(firstCordObject, secondCordObject, thirdCordObject, fourthCordObject)

    }
    var currentRotation = m_trans.get_rotation(_selected_obj);
    var rotationResult =currentRotation[2].toFixed(2); 
    if(rotationResult>-0.4&&rotationResult<-0.3){
        // var distanceFirst = Math.round(m_trans.distance(firstCornerCordObject, firstCordObjectCalculation)*100)/2;
        // console.log(distanceFirst/Math.sqrt(2));
        // var result = Math.round(distanceFirst/Math.sqrt(2))/100;
        m_trans.get_translation(firstCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[1];
        firstWallCordVec3[1]=result;
        m_trans.get_translation(secondCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[0];
        secondWallCordVec3[0]=result;
        m_trans.get_translation(thirdCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[1];
        thirdWallCordVec3[1]=result;
        m_trans.get_translation(fourthCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[0];
        fourthWallCordVec3[0]=result;
    }

    if(rotationResult>-0.95&&rotationResult<-0.9){
        // var distanceFirst = Math.round(m_trans.distance(firstCornerCordObject, firstCordObjectCalculation)*100)/2;
        // var result = Math.round(distanceFirst/Math.sqrt(2))/100;
        m_trans.get_translation(fourthCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[1];
        firstWallCordVec3[1]=result;
        m_trans.get_translation(firstCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[0];
        secondWallCordVec3[0]=result;
        m_trans.get_translation(secondCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[1];
        thirdWallCordVec3[1]=result;
        m_trans.get_translation(thirdCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[0];
        fourthWallCordVec3[0]=result;
    }
    if(rotationResult>0.9&&rotationResult<0.95){
        // var distanceFirst = Math.round(m_trans.distance(firstCornerCordObject, firstCordObjectCalculation)*100)/2;
        // var result = Math.round(distanceFirst/Math.sqrt(2))/100;
        m_trans.get_translation(thirdCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[1];
        firstWallCordVec3[1]=result;
        m_trans.get_translation(fourthCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[0];
        secondWallCordVec3[0]=result;
        m_trans.get_translation(firstCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[1];
        thirdWallCordVec3[1]=result;
        m_trans.get_translation(secondCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[0];
        fourthWallCordVec3[0]=result;
    }
    if(rotationResult>0.3&&rotationResult<0.4){
        // var distanceFirst = Math.round(m_trans.distance(firstCornerCordObject, firstCordObjectCalculation)*100)/2;
        // var result = Math.round(distanceFirst/Math.sqrt(2))/100;
        m_trans.get_translation(secondCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[1];
        firstWallCordVec3[1]=result;
        m_trans.get_translation(thirdCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[0];
        secondWallCordVec3[0]=result;
        m_trans.get_translation(fourthCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[1];
        thirdWallCordVec3[1]=result;
        m_trans.get_translation(firstCornerCordObject, tempVec3Corner);
        var result=tempVec3Corner[0];
        fourthWallCordVec3[0]=result;
    }
    m_trans.set_translation_v(firstWallCordObject, firstWallCordVec3);
    m_trans.set_translation_v(secondWallCordObject, secondWallCordVec3);
    m_trans.set_translation_v(thirdWallCordObject, thirdWallCordVec3);
    m_trans.set_translation_v(fourthWallCordObject, fourthWallCordVec3);

}


async function repositionArrowsOnRotatedObj(firstCordObject,
    secondCordObject,
    thirdCordObject,
    fourthCordObject){
        m_trans.get_translation(firstCordObject, tempVec3Arrows);
        ArrowX1Vec3[0]=await tempVec3Arrows[0];
        ArrowX1Vec3[1]=await tempVec3Arrows[1];

        m_trans.get_translation(thirdCordObject, tempVec3Arrows);
        ArrowX2Vec3[0]=await tempVec3Arrows[0];
        ArrowX2Vec3[1]=await tempVec3Arrows[1];

        m_trans.get_translation(secondCordObject, tempVec3Arrows);
        ArrowY1Vec3[0]=await tempVec3Arrows[0];
        ArrowY1Vec3[1]=await tempVec3Arrows[1];

        m_trans.get_translation(fourthCordObject, tempVec3Arrows);
        ArrowY2Vec3[0]=await tempVec3Arrows[0];
        ArrowY2Vec3[1]=await tempVec3Arrows[1];

        m_trans.set_translation_v(arrowX1Object, ArrowX1Vec3);
        m_trans.set_translation_v(arrowX2Object, ArrowX2Vec3);
        m_trans.set_translation_v(arrowY1Object, ArrowY1Vec3);
        m_trans.set_translation_v(arrowY2Object, ArrowY2Vec3);
        showDistance();
}



function showDistance(){
        var selectedNumber;
        
        var result = distanceX1*100;
        result = Math.trunc(result);
        m_trans.get_translation(arrowX1Object, tempVec3Numbers);
        m_trans.get_translation(arrowX1Object, tempVec3HideNumbers);
        tempVec3Numbers[0] -=0.5; 
        tempVec3HideNumbers[2]=-100;

        for (var i = 0; i < numbers.length; i++) {
            m_trans.set_translation_v(numbersX1[i], tempVec3HideNumbers);
            m_trans.set_translation_v(numbersX1Tenth[i], tempVec3HideNumbers);
            m_trans.set_translation_v(numbersX1Hundreds[i], tempVec3HideNumbers);
        }

        switch(result%10){
            case 1:
                selectedNumber = numbersX1[1];
                break;
            case 2:
                selectedNumber = numbersX1[2];
                break;
            case 3:
                selectedNumber = numbersX1[3];
                break;
            case 4:
                selectedNumber = numbersX1[4] ;
                break;
            case 5:
                selectedNumber = numbersX1[5];
                break;
            case 6:
                selectedNumber = numbersX1[6];
                break;
            case 7:
                selectedNumber = numbersX1[7];
                break;
            case 8:
                selectedNumber = numbersX1[8];
                break;
            case 9:
                selectedNumber = numbersX1[9];
                break;
            case 0:
                selectedNumber = numbersX1[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);

        tempVec3Numbers[0] -=0.1; 
        result= result/10;
        result = Math.trunc(result);
        switch(result%10){
            case 1:
                selectedNumber = numbersX1Tenth[1];
                break;
            case 2:
                selectedNumber = numbersX1Tenth[2];
                break;
            case 3:
                selectedNumber = numbersX1Tenth[3];
                break;
            case 4:
                selectedNumber = numbersX1Tenth[4] ;
                break;
            case 5:
                selectedNumber = numbersX1Tenth[5];
                break;
            case 6:
                selectedNumber = numbersX1Tenth[6];
                break;
            case 7:
                selectedNumber = numbersX1Tenth[7];
                break;
            case 8:
                selectedNumber = numbersX1Tenth[8];
                break;
            case 9:
                selectedNumber = numbersX1Tenth[9];
                break;
            case 0:
                selectedNumber = numbersX1Tenth[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);

        tempVec3Numbers[0] -=0.1; 
        result= result/10;
        result = Math.trunc(result);
        switch(result%10){
            case 1:
                selectedNumber = numbersX1Hundreds[1];
                break;
            case 2:
                selectedNumber = numbersX1Hundreds[2];
                break;
            case 3:
                selectedNumber = numbersX1Hundreds[3];
                break;
            case 4:
                selectedNumber = numbersX1Hundreds[4] ;
                break;
            case 5:
                selectedNumber = numbersX1Hundreds[5];
                break;
            case 6:
                selectedNumber = numbersX1Hundreds[6];
                break;
            case 7:
                selectedNumber = numbersX1Hundreds[7];
                break;
            case 8:
                selectedNumber = numbersX1Hundreds[8];
                break;
            case 9:
                selectedNumber = numbersX1Hundreds[9];
                break;
            case 0:
                selectedNumber = numbersX1Hundreds[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);


        result = distanceX2*100;
        result = Math.trunc(result);
        
        m_trans.get_translation(arrowX2Object, tempVec3Numbers);
        m_trans.get_translation(arrowX2Object, tempVec3HideNumbers);
        tempVec3Numbers[0] +=0.7; 
        tempVec3HideNumbers[2]=-100;

        for (var i = 0; i < numbers.length; i++) {
            m_trans.set_translation_v(numbersX2[i], tempVec3HideNumbers);
            m_trans.set_translation_v(numbersX2Tenth[i], tempVec3HideNumbers);
            m_trans.set_translation_v(numbersX2Hundreds[i], tempVec3HideNumbers);
        }

        switch(result%10){
            case 1:
                selectedNumber = numbersX2[1];
                break;
            case 2:
                selectedNumber = numbersX2[2];
                break;
            case 3:
                selectedNumber = numbersX2[3];
                break;
            case 4:
                selectedNumber = numbersX2[4] ;
                break;
            case 5:
                selectedNumber = numbersX2[5];
                break;
            case 6:
                selectedNumber = numbersX2[6];
                break;
            case 7:
                selectedNumber = numbersX2[7];
                break;
            case 8:
                selectedNumber = numbersX2[8];
                break;
            case 9:
                selectedNumber = numbersX2[9];
                break;
            case 0:
                selectedNumber = numbersX2[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);
        m_trans.get_translation(arrowX2Object, tempVec3Numbers);
        tempVec3Numbers[0] +=0.6; 
        result= result/10;
        result = Math.trunc(result);
        switch(result%10){
            case 1:
                selectedNumber = numbersX2Tenth[1];
                break;
            case 2:
                selectedNumber = numbersX2Tenth[2];
                break;
            case 3:
                selectedNumber = numbersX2Tenth[3];
                break;
            case 4:
                selectedNumber = numbersX2Tenth[4] ;
                break;
            case 5:
                selectedNumber = numbersX2Tenth[5];
                break;
            case 6:
                selectedNumber = numbersX2Tenth[6];
                break;
            case 7:
                selectedNumber = numbersX2Tenth[7];
                break;
            case 8:
                selectedNumber = numbersX2Tenth[8];
                break;
            case 9:
                selectedNumber = numbersX2Tenth[9];
                break;
            case 0:
                selectedNumber = numbersX2Tenth[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);

        m_trans.get_translation(arrowX2Object, tempVec3Numbers);
        tempVec3Numbers[0] +=0.5; 
        result= result/10;
        result = Math.trunc(result);
        switch(result%10){
            case 1:
                selectedNumber = numbersX2Hundreds[1];
                break;
            case 2:
                selectedNumber = numbersX2Hundreds[2];
                break;
            case 3:
                selectedNumber = numbersX2Hundreds[3];
                break;
            case 4:
                selectedNumber = numbersX2Hundreds[4] ;
                break;
            case 5:
                selectedNumber = numbersX2Hundreds[5];
                break;
            case 6:
                selectedNumber = numbersX2Hundreds[6];
                break;
            case 7:
                selectedNumber = numbersX2Hundreds[7];
                break;
            case 8:
                selectedNumber = numbersX2Hundreds[8];
                break;
            case 9:
                selectedNumber = numbersX2Hundreds[9];
                break;
            case 0:
                selectedNumber = numbersX2Hundreds[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);

        m_trans.get_translation(arrowY2Object, tempVec3Numbers);
        m_trans.get_translation(arrowY2Object, tempVec3HideNumbers);
        tempVec3Numbers[1] -=0.5; 
        tempVec3HideNumbers[2]=-100;

        for (var i = 0; i < numbers.length; i++) {
            m_trans.set_translation_v(numbersY2[i], tempVec3HideNumbers);
            m_trans.set_translation_v(numbersY2Tenth[i], tempVec3HideNumbers);
            m_trans.set_translation_v(numbersY2Hundreds[i], tempVec3HideNumbers);
        }

        result = distanceY2*100;
        result = Math.trunc(result);
        switch(result%10){
            case 1:
                selectedNumber = numbersY2[1];
                break;
            case 2:
                selectedNumber = numbersY2[2];
                break;
            case 3:
                selectedNumber = numbersY2[3];
                break;
            case 4:
                selectedNumber = numbersY2[4] ;
                break;
            case 5:
                selectedNumber = numbersY2[5];
                break;
            case 6:
                selectedNumber = numbersY2[6];
                break;
            case 7:
                selectedNumber = numbersY2[7];
                break;
            case 8:
                selectedNumber = numbersY2[8];
                break;
            case 9:
                selectedNumber = numbersY2[9];
                break;
            case 0:
                selectedNumber = numbersY2[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);
 

 
        

        tempVec3Numbers[1] -=0.1; 
        result= result/10;
        result = Math.trunc(result);
        switch(result%10){
            case 1:
                selectedNumber = numbersY2Tenth[1];
                break;
            case 2:
                selectedNumber = numbersY2Tenth[2];
                break;
            case 3:
                selectedNumber = numbersY2Tenth[3];
                break;
            case 4:
                selectedNumber = numbersY2Tenth[4] ;
                break;
            case 5:
                selectedNumber = numbersY2Tenth[5];
                break;
            case 6:
                selectedNumber = numbersY2Tenth[6];
                break;
            case 7:
                selectedNumber = numbersY2Tenth[7];
                break;
            case 8:
                selectedNumber = numbersY2Tenth[8];
                break;
            case 9:
                selectedNumber = numbersY2Tenth[9];
                break;
            case 0:
                selectedNumber = numbersY2Tenth[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);


        tempVec3Numbers[1] -=0.1; 
        
        result= result/10;
        result = Math.trunc(result);
        switch(result%10){
            case 1:
                selectedNumber = numbersY2Hundreds[1];
                break;
            case 2:
                selectedNumber = numbersY2Hundreds[2];
                break;
            case 3:
                selectedNumber = numbersY2Hundreds[3];
                break;
            case 4:
                selectedNumber = numbersY2Hundreds[4] ;
                break;
            case 5:
                selectedNumber = numbersY2Hundreds[5];
                break;
            case 6:
                selectedNumber = numbersY2Hundreds[6];
                break;
            case 7:
                selectedNumber = numbersY2Hundreds[7];
                break;
            case 8:
                selectedNumber = numbersY2Hundreds[8];
                break;
            case 9:
                selectedNumber = numbersY2Hundreds[9];
                break;
            case 0:
                selectedNumber = numbersY2Hundreds[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);




        result = distanceY1*100;
        result = Math.trunc(result);
        
        m_trans.get_translation(arrowY1Object, tempVec3Numbers);
        m_trans.get_translation(arrowY1Object, tempVec3HideNumbers);
        tempVec3Numbers[1] +=0.7; 
        tempVec3HideNumbers[2]=-100;

        for (var i = 0; i < numbers.length; i++) {
            m_trans.set_translation_v(numbersY1[i], tempVec3HideNumbers);
            m_trans.set_translation_v(numbersY1Tenth[i], tempVec3HideNumbers);
            m_trans.set_translation_v(numbersY1Hundreds[i], tempVec3HideNumbers);
        }
        switch(result%10){
            case 1:
                selectedNumber = numbersY1[1];
                break;
            case 2:
                selectedNumber = numbersY1[2];
                break;
            case 3:
                selectedNumber = numbersY1[3];
                break;
            case 4:
                selectedNumber = numbersY1[4] ;
                break;
            case 5:
                selectedNumber = numbersY1[5];
                break;
            case 6:
                selectedNumber = numbersY1[6];
                break;
            case 7:
                selectedNumber = numbersY1[7];
                break;
            case 8:
                selectedNumber = numbersY1[8];
                break;
            case 9:
                selectedNumber = numbersY1[9];
                break;
            case 0:
                selectedNumber = numbersY1[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);
        m_trans.get_translation(arrowY1Object, tempVec3Numbers);
        tempVec3Numbers[1] +=0.6; 
        result= result/10;
        result = Math.trunc(result);
        switch(result%10){
            case 1:
                selectedNumber = numbersY1Tenth[1];
                break;
            case 2:
                selectedNumber = numbersY1Tenth[2];
                break;
            case 3:
                selectedNumber = numbersY1Tenth[3];
                break;
            case 4:
                selectedNumber = numbersY1Tenth[4] ;
                break;
            case 5:
                selectedNumber = numbersY1Tenth[5];
                break;
            case 6:
                selectedNumber = numbersY1Tenth[6];
                break;
            case 7:
                selectedNumber = numbersY1Tenth[7];
                break;
            case 8:
                selectedNumber = numbersY1Tenth[8];
                break;
            case 9:
                selectedNumber = numbersY1Tenth[9];
                break;
            case 0:
                selectedNumber = numbersY1Tenth[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);

        m_trans.get_translation(arrowY1Object, tempVec3Numbers);
        tempVec3Numbers[1] +=0.5; 
        result= result/10;
        result = Math.trunc(result);
        switch(result%10){
            case 1:
                selectedNumber = numbersY1Hundreds[1];
                break;
            case 2:
                selectedNumber = numbersY1Hundreds[2];
                break;
            case 3:
                selectedNumber = numbersY1Hundreds[3];
                break;
            case 4:
                selectedNumber = numbersY1Hundreds[4] ;
                break;
            case 5:
                selectedNumber = numbersY1Hundreds[5];
                break;
            case 6:
                selectedNumber = numbersY1Hundreds[6];
                break;
            case 7:
                selectedNumber = numbersY1Hundreds[7];
                break;
            case 8:
                selectedNumber = numbersY1Hundreds[8];
                break;
            case 9:
                selectedNumber = numbersY1Hundreds[9];
                break;
            case 0:
                selectedNumber = numbersY1Hundreds[0];
                break;
        }
        m_trans.set_translation_v(selectedNumber, tempVec3Numbers);



        



}



function initWallControls(){
    var pierwszaSciana = "x1Wall";
    var drugaSciana = "y1Wall";
    var trzeciaSciana = "x2Wall";
    var czwartaSciana = "y2Wall";

    var floorObject = m_scenes.get_object_by_name("Floor");
    var mainLampObject = m_scenes.get_object_by_name("mainLamp");


    var floorOutlineObject = m_scenes.get_object_by_name("FloorOutline");
    var pierwszaScianaOutlineObject = m_scenes.get_object_by_name("pierwszaScianaOutline");
    var drugaScianaOutlineObject = m_scenes.get_object_by_name("drugaScianaOutline");
    var trzeciaScianaOutlineObject = m_scenes.get_object_by_name("trzeciaScianaOutline");
    var czwartaScianaOutlineObject = m_scenes.get_object_by_name("czwartaScianaOutline");

    var numericPierwszaSciana = document.getElementById(pierwszaSciana);
    var pierwszaScianaObject = m_scenes.get_object_by_name("pierwszaSciana");
    var numericDrugaSciana = document.getElementById(drugaSciana);
    var drugaScianaObject = m_scenes.get_object_by_name("drugaSciana");
    var numericTrzeciaSciana = document.getElementById(trzeciaSciana);
    var trzeciaScianaObject = m_scenes.get_object_by_name("trzeciaSciana");
    var numericCzwartaSciana = document.getElementById(czwartaSciana);
    var czwartaScianaObject = m_scenes.get_object_by_name("czwartaSciana");
    numericPierwszaSciana.oninput = function(){
        if(numericPierwszaSciana.value>=100 && numericPierwszaSciana.value<1001 ){
        numericTrzeciaSciana.value = numericPierwszaSciana.value;
        m_geom.set_shape_key_value(pierwszaScianaObject, "dlugosc", (numericPierwszaSciana.value-100)/100);
        m_geom.set_shape_key_value(trzeciaScianaObject, "dlugosc", (numericPierwszaSciana.value-100)/100);
        m_geom.set_shape_key_value(floorObject, "length", (numericPierwszaSciana.value-100)/100);
        m_geom.set_shape_key_value(floorOutlineObject, "length", (numericPierwszaSciana.value-100)/100);
        m_geom.set_shape_key_value(pierwszaScianaOutlineObject, "dlugosc", (numericPierwszaSciana.value-100)/100);
        m_geom.set_shape_key_value(trzeciaScianaOutlineObject, "dlugosc", (numericPierwszaSciana.value-100)/100);
        
        m_trans.set_translation_obj_rel(mainLampObject, (numericDrugaSciana.value/100)/2,(numericPierwszaSciana.value/100)/2-0.25, 5, pierwszaScianaObject);

        m_trans.set_translation_obj_rel(drugaScianaObject, 0.6, (numericPierwszaSciana.value/100)-0.4, 0, pierwszaScianaObject)
        m_obj.update_boundings(pierwszaScianaObject);
        m_obj.update_boundings(drugaScianaObject);
        m_obj.update_boundings(trzeciaScianaObject);
        m_obj.update_boundings(czwartaScianaObject);
            WALL_Y_MAX=numericPierwszaSciana.value/100-4.2;
        }
    }
    numericTrzeciaSciana.oninput = function(){
        if(numericTrzeciaSciana.value>100 && numericTrzeciaSciana.value<1001 ){
        numericPierwszaSciana.value = numericTrzeciaSciana.value;
        m_geom.set_shape_key_value(pierwszaScianaObject, "dlugosc", (numericTrzeciaSciana.value-100)/100);
        m_geom.set_shape_key_value(trzeciaScianaObject, "dlugosc", (numericTrzeciaSciana.value-100)/100);
        m_geom.set_shape_key_value(floorObject, "length", (numericTrzeciaSciana.value-100)/100);
        m_geom.set_shape_key_value(floorOutlineObject, "length", (numericTrzeciaSciana.value-100)/100);
        m_geom.set_shape_key_value(pierwszaScianaOutlineObject, "dlugosc", (numericTrzeciaSciana.value-100)/100);
        m_geom.set_shape_key_value(trzeciaScianaOutlineObject, "dlugosc", (numericTrzeciaSciana.value-100)/100);

        m_trans.set_translation_obj_rel(mainLampObject, (numericDrugaSciana.value/100)/2,(numericPierwszaSciana.value/100)/2-0.25, 5, pierwszaScianaObject);

        m_trans.set_translation_obj_rel(drugaScianaObject, 0.6, (numericTrzeciaSciana.value/100)-0.4, 0, pierwszaScianaObject)
        m_obj.update_boundings(pierwszaScianaObject);
        m_obj.update_boundings(drugaScianaObject);
        m_obj.update_boundings(trzeciaScianaObject);
        m_obj.update_boundings(czwartaScianaObject);
             WALL_Y_MAX=numericTrzeciaSciana.value/100-4.2;
        }
       
    }
    
    numericDrugaSciana.oninput = function(){
        if(numericDrugaSciana.value>100 && numericDrugaSciana.value<1001 ){
        numericCzwartaSciana.value = numericDrugaSciana.value;
        m_geom.set_shape_key_value(drugaScianaObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(czwartaScianaObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(floorObject, "width", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(floorOutlineObject, "width", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(drugaScianaOutlineObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(czwartaScianaOutlineObject, "dlugosc", (numericDrugaSciana.value-100)/100);


        m_trans.set_translation_obj_rel(mainLampObject, (numericDrugaSciana.value/100)/2,(numericPierwszaSciana.value/100)/2-0.25, 5, pierwszaScianaObject);

        m_trans.set_translation_obj_rel(trzeciaScianaObject, -0.6, (numericDrugaSciana.value/100)-0.4, 0, czwartaScianaObject)
        m_obj.update_boundings(pierwszaScianaObject);
        m_obj.update_boundings(drugaScianaObject);
        m_obj.update_boundings(trzeciaScianaObject);
        m_obj.update_boundings(czwartaScianaObject);
            
            WALL_X_MAX=numericDrugaSciana.value/100-3.8;
        } 
    }
        numericCzwartaSciana.oninput = function(){
        if(numericCzwartaSciana.value>100 && numericCzwartaSciana.value<1001 ){
        numericDrugaSciana.value = numericCzwartaSciana.value;
        m_geom.set_shape_key_value(drugaScianaObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(czwartaScianaObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(floorObject, "width", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(floorOutlineObject, "width", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(drugaScianaOutlineObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(czwartaScianaOutlineObject, "dlugosc", (numericDrugaSciana.value-100)/100);

        m_trans.set_translation_obj_rel(mainLampObject, (numericDrugaSciana.value/100)/2,(numericPierwszaSciana.value/100)/2-0.25, 5, pierwszaScianaObject);

        m_trans.set_translation_obj_rel(trzeciaScianaObject, -0.6, (numericDrugaSciana.value/100)-0.4, 0, czwartaScianaObject)
        m_obj.update_boundings(pierwszaScianaObject);
        m_obj.update_boundings(drugaScianaObject);
        m_obj.update_boundings(trzeciaScianaObject);
        m_obj.update_boundings(czwartaScianaObject);
            
            WALL_X_MAX=numericCzwartaSciana.value/100-3.8;
        } 
    }

    var windowHeightInput = document.getElementById("heightOfWindow");
    windowHeightInput.oninput = function(){
        
        var objectPosition = new Float32Array(3);
        m_trans.get_translation(_selected_obj, objectPosition);
        objectPosition[2]=windowHeightInput.value/100;
        m_trans.set_translation_v(_selected_obj,objectPosition);
        m_obj.update_boundings(_selected_obj);
    }

    var doorWidthInput = document.getElementById("doorWidth");
    doorWidthInput.oninput = function(){
        var value = doorWidthInput.value-64;
        m_geom.set_shape_key_value(_selected_obj, "length", value);
    }

    m_geom.set_shape_key_value(pierwszaScianaObject, "dlugosc", 4);
    m_geom.set_shape_key_value(drugaScianaObject, "dlugosc", 4);
    m_geom.set_shape_key_value(trzeciaScianaObject, "dlugosc", 4);
    m_geom.set_shape_key_value(czwartaScianaObject, "dlugosc", 4);
    m_geom.set_shape_key_value(floorObject, "width", 4);
    m_geom.set_shape_key_value(floorObject, "length", 4);
    m_geom.set_shape_key_value(floorOutlineObject, "length", 4);
    m_geom.set_shape_key_value(floorOutlineObject, "width", 4);
    m_geom.set_shape_key_value(pierwszaScianaOutlineObject, "dlugosc", 4);
    m_geom.set_shape_key_value(drugaScianaOutlineObject, "dlugosc", 4);
    m_geom.set_shape_key_value(trzeciaScianaOutlineObject, "dlugosc", 4);
    m_geom.set_shape_key_value(czwartaScianaOutlineObject, "dlugosc", 4);
    
    m_trans.set_translation_obj_rel(trzeciaScianaObject, 0.6, 5-0.4, 0, drugaScianaObject)
    m_trans.set_translation_obj_rel(drugaScianaObject, -4, 0, 0, drugaScianaObject)
    m_trans.set_translation_obj_rel(mainLampObject, 2.5, 2, 5, drugaScianaObject)


}

function stworzInterfejs(){


    var pierwszaSciana = "pierwszaSciana";
    var drugaSciana = "drugaSciana";
    var trzeciaSciana = "trzeciaSciana";
    var czwartaSciana = "czwartaSciana";
    create_numericUpDown(pierwszaSciana);
    create_numericUpDown(drugaSciana);
    create_numericUpDown(trzeciaSciana);
    create_numericUpDown(czwartaSciana);
    var numericPierwszaSciana = document.getElementById(pierwszaSciana);
    var pierwszaScianaObject = m_scenes.get_object_by_name("pierwszaSciana");
    var numericDrugaSciana = document.getElementById(drugaSciana);
    var drugaScianaObject = m_scenes.get_object_by_name("drugaSciana");
    var numericTrzeciaSciana = document.getElementById(trzeciaSciana);
    var trzeciaScianaObject = m_scenes.get_object_by_name("trzeciaSciana");
    var numericCzwartaSciana = document.getElementById(czwartaSciana);
    var czwartaScianaObject = m_scenes.get_object_by_name("czwartaSciana");
    numericPierwszaSciana.oninput = function(){
        if(numericPierwszaSciana.value>=100 && numericPierwszaSciana.value<1001 ){
        numericTrzeciaSciana.value = numericPierwszaSciana.value;
        m_geom.set_shape_key_value(pierwszaScianaObject, "dlugosc", (numericPierwszaSciana.value-100)/100);
        m_geom.set_shape_key_value(trzeciaScianaObject, "dlugosc", (numericPierwszaSciana.value-100)/100);
        
        m_trans.set_translation_obj_rel(drugaScianaObject, 0.6, (numericPierwszaSciana.value/100)-0.4, 0, pierwszaScianaObject)
        //m_transform.set_translation(drugaScianaObject, 0, 0, (numericPierwszaSciana.value-99)/100);
        m_obj.update_boundings(pierwszaScianaObject);
        m_obj.update_boundings(drugaScianaObject);
        m_obj.update_boundings(trzeciaScianaObject);
        m_obj.update_boundings(czwartaScianaObject);
            WALL_Y_MAX=numericPierwszaSciana.value/100-4.2;
        }
        
        
    }
    numericTrzeciaSciana.oninput = function(){
        if(numericTrzeciaSciana.value>100 && numericTrzeciaSciana.value<1001 ){
        numericPierwszaSciana.value = numericTrzeciaSciana.value;
        m_geom.set_shape_key_value(pierwszaScianaObject, "dlugosc", (numericTrzeciaSciana.value-100)/100);
        m_geom.set_shape_key_value(trzeciaScianaObject, "dlugosc", (numericTrzeciaSciana.value-100)/100);
        
        m_trans.set_translation_obj_rel(drugaScianaObject, 0.6, (numericTrzeciaSciana.value/100)-0.4, 0, pierwszaScianaObject)
        //m_transform.set_translation(drugaScianaObject, 0, 0, (numericPierwszaSciana.value-99)/100);
        m_obj.update_boundings(pierwszaScianaObject);
        m_obj.update_boundings(drugaScianaObject);
        m_obj.update_boundings(trzeciaScianaObject);
        m_obj.update_boundings(czwartaScianaObject);
             WALL_Y_MAX=numericTrzeciaSciana.value/100-4.2;
        }
       
    }
    
    numericDrugaSciana.oninput = function(){
        if(numericDrugaSciana.value>100 && numericDrugaSciana.value<1001 ){
        numericCzwartaSciana.value = numericDrugaSciana.value;
        m_geom.set_shape_key_value(drugaScianaObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(czwartaScianaObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        
        m_trans.set_translation_obj_rel(trzeciaScianaObject, -0.6, (numericDrugaSciana.value/100)-0.4, 0, czwartaScianaObject)
        //m_transform.set_translation(drugaScianaObject, 0, 0, (numericPierwszaSciana.value-99)/100);
        m_obj.update_boundings(pierwszaScianaObject);
        m_obj.update_boundings(drugaScianaObject);
        m_obj.update_boundings(trzeciaScianaObject);
        m_obj.update_boundings(czwartaScianaObject);
            
            WALL_X_MAX=numericDrugaSciana.value/100-3.8;
        } 
    }
        numericCzwartaSciana.oninput = function(){
        if(numericCzwartaSciana.value>100 && numericCzwartaSciana.value<1001 ){
        numericDrugaSciana.value = numericCzwartaSciana.value;
        m_geom.set_shape_key_value(drugaScianaObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        m_geom.set_shape_key_value(czwartaScianaObject, "dlugosc", (numericDrugaSciana.value-100)/100);
        
        m_trans.set_translation_obj_rel(trzeciaScianaObject, -0.6, (numericDrugaSciana.value/100)-0.4, 0, czwartaScianaObject)
        //m_transform.set_translation(drugaScianaObject, 0, 0, (numericPierwszaSciana.value-99)/100);
        m_obj.update_boundings(pierwszaScianaObject);
        m_obj.update_boundings(drugaScianaObject);
        m_obj.update_boundings(trzeciaScianaObject);
        m_obj.update_boundings(czwartaScianaObject);
            
            WALL_X_MAX=numericCzwartaSciana.value/100-3.8;
        } 
    }
        
    m_geom.set_shape_key_value(pierwszaScianaObject, "dlugosc", 4);
    m_geom.set_shape_key_value(drugaScianaObject, "dlugosc", 4);
    m_geom.set_shape_key_value(trzeciaScianaObject, "dlugosc", 4);
    m_geom.set_shape_key_value(czwartaScianaObject, "dlugosc", 4);
    m_trans.set_translation_obj_rel(trzeciaScianaObject, 0.6, 5-0.4, 0, drugaScianaObject)
    m_trans.set_translation_obj_rel(drugaScianaObject, -4, 0, 0, drugaScianaObject)


}


function create_numericUpDown(id){
    var numericUpDown = document.createElement("input");
    numericUpDown.id = id;
    numericUpDown.className = "numericUpDownRozmiarScian";
    numericUpDown.setAttribute("type","number");
    numericUpDown.setAttribute("min","100");
    numericUpDown.setAttribute("max","1000");
    numericUpDown.setAttribute("value","500");
    numericUpDown.style.position = "relative";
    //numericUpDown.style.width = "60%";
    var x = document.getElementById("main_sliders_container");
    x.appendChild(numericUpDown);
    document.body.appendChild(x);
}


function objectCoordinatesDistance(_selected_obj){
    var id = m_scenes.get_object_data_id(_selected_obj);
    var firstWallCordObject = m_scenes.get_object_by_name("firstWallCord");
    var secondWallCordObject = m_scenes.get_object_by_name("secondWallCord");
    var thirdWallCordObject = m_scenes.get_object_by_name("thirdWallCord");
    var fourthWallCordObject = m_scenes.get_object_by_name("fourthWallCord");
    var firstCordObject = m_scenes.get_object_by_name("firstCord", id);
    var secondCordObject = m_scenes.get_object_by_name("secondCord", id);
    var thirdCordObject = m_scenes.get_object_by_name("thirdCord", id);
    var fourthCordObject = m_scenes.get_object_by_name("fourthCord", id);

    var firstCornerCordObject = m_scenes.get_object_by_name("firstCornerCord", id);
    var secondCornerCordObject = m_scenes.get_object_by_name("secondCornerCord", id);
    var thirdCornerCordObject = m_scenes.get_object_by_name("thirdCornerCord", id);
    var fourthCornerCordObject = m_scenes.get_object_by_name("fourthCornerCord", id);


    // var x = document.getElementById("cordX1");
    // x.textContent= `X1 `+Math.round(m_trans.distance(firstCordObject, firstWallCordObject)*100) + ` cm`;
    // x = document.getElementById("cordY1");
    // x.textContent= `Y1 `+Math.round(m_trans.distance(secondCordObject, secondWallCordObject)*100) + ` cm`;
    // x = document.getElementById("cordX2");
    // x.textContent= `X2 `+Math.round(m_trans.distance(thirdCordObject, thirdWallCordObject)*100) + ` cm`;
    // x = document.getElementById("cordY2");
    // x.textContent= `Y2 `+Math.round(m_trans.distance(fourthCordObject, fourthWallCordObject)*100) + ` cm`;
    
    var rotation = m_trans.get_rotation(_selected_obj);
    var rotationResult = rotation[2].toFixed(2);
    switch(true) {
        case rotationResult>-0.1&&rotationResult<0.1:
            calculateDistance(firstCordObject, secondCordObject, thirdCordObject, fourthCordObject);
            break;
        case rotationResult>-0.4&&rotationResult<-0.3:
            calculateDistance(firstCornerCordObject, secondCornerCordObject, thirdCornerCordObject, fourthCornerCordObject);
            break;
        case rotationResult>-0.8&&rotationResult<-0.6:
            calculateDistance(fourthCordObject, firstCordObject, secondCordObject, thirdCordObject);
            break;
        case rotationResult>-0.95&&rotationResult<-0.9:
            calculateDistance(fourthCornerCordObject, firstCornerCordObject, secondCornerCordObject, thirdCornerCordObject);
            break;
        case rotationResult>-1.05&&rotationResult<-0.95:
            calculateDistance(thirdCordObject, fourthCordObject, firstCordObject, secondCordObject);
            break;
        case rotationResult>0.3&&rotationResult<0.4:
            calculateDistance(secondCornerCordObject, thirdCornerCordObject, fourthCornerCordObject, firstCornerCordObject);
            break;
        case rotationResult>0.6&&rotationResult<0.8:
            calculateDistance(secondCordObject, thirdCordObject, fourthCordObject, firstCordObject);
            break;
        case rotationResult>0.9&&rotationResult<0.95:
            calculateDistance(thirdCornerCordObject, fourthCornerCordObject, firstCornerCordObject, secondCornerCordObject);
            break;
        case rotationResult>0.95&&rotationResult<1.05:
            calculateDistance(thirdCordObject, fourthCordObject, firstCordObject, secondCordObject);
            break;
            
        default:
            //console.log(rotationResult);
    }
    // if(rotation[2].toFixed(2)==0){
    //     calculateDistance(firstCordObject, secondCordObject, thirdCordObject, fourthCordObject);
    // }
    // if(rotation[2].toFixed(2)==-0.38){
    //     calculateDistance(firstCornerCordObject, secondCornerCordObject, thirdCornerCordObject, fourthCornerCordObject);
    // }
    // if(rotation[2].toFixed(2)==-0.7){
    //     calculateDistance(fourthCordObject, firstCordObject, secondCordObject, thirdCordObject);
    // }


}

function calculateDistance(first, second, third, fourth){
    var firstWallCordObject = m_scenes.get_object_by_name("firstWallCord");
    var secondWallCordObject = m_scenes.get_object_by_name("secondWallCord");
    var thirdWallCordObject = m_scenes.get_object_by_name("thirdWallCord");
    var fourthWallCordObject = m_scenes.get_object_by_name("fourthWallCord");
    var x = document.getElementById("cordX1");
    distanceX1=m_trans.distance(first, firstWallCordObject)+0.01;
    x.textContent= `X1 `+Math.round(m_trans.distance(first, firstWallCordObject)*100) + ` cm`;
    x = document.getElementById("cordY1");
    x.textContent= `Y1 `+Math.round(m_trans.distance(second, secondWallCordObject)*100) + ` cm`;
    distanceY1=m_trans.distance(second, secondWallCordObject)+0.01;
    x = document.getElementById("cordX2");
    x.textContent= `X2 `+Math.round(m_trans.distance(third, thirdWallCordObject)*100) + ` cm`;
    distanceX2=m_trans.distance(third, thirdWallCordObject)+0.01;
    x = document.getElementById("cordY2");
    x.textContent= `Y2 `+Math.round(m_trans.distance(fourth, fourthWallCordObject)*100) + ` cm`;
    distanceY2=m_trans.distance(fourth, fourthWallCordObject)+0.01;
}














init();
