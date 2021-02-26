var dev_api_url = "https://dev-api-dynacrop.worldfromspace.cz";
var django_dev_api_url = "https://dev-api-dynacrop.worldfromspace.cz:8080";
var prod_api_url = "https://api-dynacrop.worldfromspace.cz";
var local_api_url = "http://127.0.0.1:5000";
var api_v2_sufix = "/api/v2/";
var api_url = prod_api_url + api_v2_sufix;
var rr_post_wait_time = 1000;
var rr_fail_after = 3600;
var api_key = null;

function setTimeoutUntilFail(fail_after_timeout){
    rr_fail_after = parseInt(fail_after_timeout);
}

function setApiKey(key){
  api_key = key;
}

function useDevApi(){
  api_url = dev_api_url + api_v2_sufix;
}

function useDjangoDevApi(){
  api_url = django_dev_api_url + api_v2_sufix;
}

function useProdApi(){
  api_url = prod_api_url + api_v2_sufix;
}

function useLocalApi(){
  api_url = local_api_url + api_v2_sufix;
}


function waitUntilDoneWorker(id, endpoint, whenDone, whenError, fail_after){
  $.ajax({
      url: api_url+endpoint+"/"+id,
      type: 'get',
      data: { "api_key" : api_key },
      processData: true,
      success: function( data, textStatus, jQxhr ){
          // console.log(JSON.stringify(data));
          if(data['status'] == "completed"){
              //console.log("Request completed");
              whenDone(data);
          }
          else if(data['status'] == "error"){
              whenError(data);
          }
          else{
              waitUntilDone(id, endpoint, whenDone, whenError, fail_after - 1);
          }
      },
      error: function( jqXhr, textStatus, errorThrown ){
          whenError({"status": jqXhr.status, "response": jqXhr.responseText });
      }
  });
}

function waitUntilDone(id, endpoint, whenDone, whenError, fail_after=rr_fail_after, wait_time=rr_post_wait_time){
  if(fail_after > 0){
      setTimeout(waitUntilDoneWorker.bind(null, id, endpoint, whenDone, whenError, fail_after), wait_time);
  }
  else{
      whenError({"status": "error", "response": "not completed in "+(rr_fail_after*rr_post_wait_time)/1000+" seconds."});
  }
}

function defaultWhenError(error){
    console.log(error);
}

function uploadPolyon(wtk, whenDone, whenError = null, smi_enabled = false, max_mean_cloud_cover = 0.1){
  if(whenError == null){
    whenError = defaultWhenError;
  }
  var endpoint = 'polygons';
  var jsonData = {"geometry" : wtk, "api_key": api_key, "smi_enabled": smi_enabled, "max_mean_cloud_cover": max_mean_cloud_cover};
  postData(endpoint, jsonData, whenDone, whenError);
}

function postRenderingRequest(jsonData, whenDone, whenError = null){
  if(whenError == null){
    whenError = defaultWhenError;
  }
  var endpoint = 'processing_request';
  jsonData['api_key'] = api_key;
  postData(endpoint, jsonData, whenDone, whenError);
}

function postPolygon(jsonData, whenDone, whenError = null){
  if(whenError == null){
    whenError = defaultWhenError;
  }
  var endpoint = 'polygons';
  jsonData['api_key'] = api_key;
  postData(endpoint, jsonData, whenDone, whenError);
}

function postData(endpoint, jsonData, whenDone, whenError){
  $.ajax({
      url: api_url+endpoint,
      dataType: 'json',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(jsonData),
      processData: false,
      success: function( data, textStatus, jQxhr ){
          waitUntilDone(data['id'], endpoint, whenDone, whenError);
      },
      error: function( jqXhr, textStatus, errorThrown ){
          whenError({"status": jqXhr.status, "response": jqXhr.responseText });
      }
  });
}


/*
function showGeotiff(url, wtk_geometry, map){
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      parseGeoraster(arrayBuffer).then(georaster => {
        // console.log("georaster:", georaster);
        var layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: 0.9
        });
        layer.addTo(map);

        map.fitBounds(layer.getBounds());
    });
  });
}


function showPng(png_url, wtk_geometry, map){
  var feature = L.geoJson(wellknown.parse(wtk_geometry));
  var img_layer = L.imageOverlay(png_url, feature.getBounds()).addTo(map);
  map.fitBounds(img_layer.getBounds());
}

function addTileLayer(color_tiff_url, wtk_geometry, map){
    var feature = L.geoJson(wellknown.parse(wtk_geometry));
    var lyr = L.tileLayer(tiles_url+color_tiff_url, {tms: false, opacity: 1.0, attribution: ""});
    lyr.addTo(map);
    map.fitBounds(feature.getBounds());
    console.log(tiles_url+color_tiff_url);
}
*/
