api_key = "api_key";
api_url = "https://api-dynacrop.worldfromspace.cz/api/v2/";
tiles_url = "https://nc70mg4l6d.execute-api.eu-central-1.amazonaws.com/{z}/{x}/{y}.png?nodata=0&resampling_method=nearest&url=";


function waitUntilDoneWorker(id, endpoint, whenDone, fail_after){
  $.ajax({
      url: api_url+endpoint+"/"+id,
      type: 'get',
      data: { "api_key" : api_key },
      processData: true,
      success: function( data, textStatus, jQxhr ){
          console.log(JSON.stringify(data));
          if(data['status'] == "completed"){
              console.log("Request completed");
              whenDone(data);
          }
          else{
              waitUntilDone(id, endpoint, whenDone, 1000, fail_after - 1);
          }
      },
      error: function( jqXhr, textStatus, errorThrown ){
          console.log(errorThrown);
      }
  });
}

function waitUntilDone(id, endpoint, whenDone, wait_time, fail_after){
  if(fail_after > 0){
      setTimeout(waitUntilDoneWorker.bind(null, id, endpoint, whenDone, fail_after), wait_time);
  }
  else{
      console.log("Reuqest not completed");
  }
}

function newPolygon(wtk){
  var endpoint = 'polygons';
  var jsonData = {"geometry" : wtk, "api_key": api_key};

  $.ajax({
      url: api_url+endpoint,
      dataType: 'json',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(jsonData),
      processData: false,
      success: function( data, textStatus, jQxhr ){
          console.log(JSON.stringify(data));
          waitUntilDone(data['id'], endpoint, function(response) { console.log("Polygon "+response['id']+" ready! "); }, 0, 60);
      },
      error: function( jqXhr, textStatus, errorThrown ){
          console.log(errorThrown);
      }
  });
}

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
    // "https://nc70mg4l6d.execute-api.eu-central-1.amazonaws.com/{x}/{y}/{z}.png?url=https://dev-dynacrop-data.s3.amazonaws.com/8fc9ad6b99de7a4714689096893c566cc063f1c984d55ce2af3c8f23d797f790/observation_color.tiff&nodata=0&resampling_method=nearest"
}


function post_rendering_request(polygon_id, rendering_type, date_from, date_to, layer, whenDone){
  var endpoint = 'processing_request';
  var jsonData = { "rendering_type": rendering_type, "date_from": date_from, "date_to": date_to, "layer": layer, "polygon_id": polygon_id, "api_key": api_key};

  $.ajax({
      url: api_url+endpoint,
      dataType: 'json',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(jsonData),
      processData: false,
      success: function( data, textStatus, jQxhr ){
          console.log(JSON.stringify(data));
          waitUntilDone(data['id'], endpoint, whenDone, 0, 60);
      },
      error: function( jqXhr, textStatus, errorThrown ){
          console.log(errorThrown);
      }
  });

}
