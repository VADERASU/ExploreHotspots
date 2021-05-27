class KDERenderer {
  constructor(leafletMap){

    this.vtkDataSet = null;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    // Color Maps
    this.colorBrewerQuantitative12 = new Uint8Array([
      166,206,227,
      31,120,180,
      178,223,138,
      51,160,44,
      251,154,153,
      227,26,28,
      253,191,111,
      255,127,0,
      202,178,214,
      106,61,154,
      255,255,153,
      177,89,40,
      0,0,0,
      0,0,0,
      0,0,0,
      0,0,0,
    ]);
    this.colorBrewerQuantitative6 = new Uint8Array([
      31,120,180,
      51,160,44,
      227,26,28,
      255,127,0,
      106,61,154,
      177,89,40,
      0,0,0,
      0,0,0,
      0,0,0,
      0,0,0,
      0,0,0,
      0,0,0,
      0,0,0,
      0,0,0,
      0,0,0,
      0,0,0,
    ]);
    // .map( x=>parseInt(x[i]/255)});
    this.colorMap = this.createTexture(3,[1,16],this.colorBrewerQuantitative12);

    // Camera
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1, 2 );
    this.camera.position.set(0,0,1);

    // Scene
    this.scene = new THREE.Scene();

    this.consts = {
      opacity: 0.8,
      resolution: [0,0],
      nContours: 7,
      contourWidth: 1,
      idIdx: 0,
      bgIdx: 0
    };



    this.planeMaterial = new THREE.MeshBasicMaterial({color:'red'});
    this.uniforms = {
      colorMap: {type:'t', value: this.colorMap},
      texKDE: {type:'t', value: null},
      texSegmentation: {type:'t', value: null},
    };

    this.quad = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2,2),
        this.planeMaterial
    );
    this.scene.add(this.quad);


    // Leaflet
    this.leafletMap = leafletMap;
    this.leafletMap.on('zoomstart', ()=>{
        this.renderer.domElement.style.display = 'none';
    });
    this.leafletMap.on('zoomend', ()=>{
        this.renderer.domElement.style.display = 'block';
    });
  }

  appendCanvas(lat0, lon0, lat1, lon1){
    if(!this.imageOverlay){
      // Create empty ImageOverlay
      this.imageOverlay = new L.ImageOverlay(
      	'',	// no image
      	[[lon0,lat0], [lon1, lat1]] // image bounds
      );

      this.imageOverlay.addTo(this.leafletMap);

      // Exchange the image of the ImageOverlay with the WebGL canvas
      this.imageOverlay._image.parentElement.replaceChild(
      	this.renderer.domElement,	// new Element
      	this.imageOverlay._image		// old Element
      );
      this.imageOverlay._image = this.renderer.domElement;

      // Force Leaflet to update the canvas size and position
      this.leafletMap.setZoom(12);
    }
  }

  getVertexShader(){
      return `
precision highp float;

attribute vec3 position;
varying vec2 vUV;

void main(){
    vUV = position.xy/2. + vec2(0.5);
    gl_Position = vec4(position,1);
}
      `;
  }

  getFragmentShader(){
        return `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform sampler2D colorMap;
uniform sampler2D texKDE;
uniform sampler2D texSegmentation;
uniform int idSource;


const float opacity = ${this.consts.opacity};
const vec2 resolution = vec2(${this.consts.resolution[0]},${this.consts.resolution[1]});
varying vec2 vUV;

float isolineIntensity(){

    float v = texture2D(texKDE, vUV).a*${(2*this.consts.nContours).toFixed(1)};

    float d = fract(v);
    if(mod(v, 2.0) > 1.) d = 1.-d;

    return v > 0.02 ? clamp( d/(${this.consts.contourWidth.toFixed(2)}*fwidth(v)), 0.0, 1.0 ) : 1.0;
}

void main() {
    float nColors = 12.0;

    // x: sss, y: mtls, z: mtcs, a: mcs
    vec4 segmentation = floor( texture2D(texSegmentation, vUV)*255.0 );

    float bg = segmentation[${this.consts.bgIdx}];
    float id = segmentation[${this.consts.idIdx}];

    vec3 color = id>254.0
      ? vec3(1,1,1)
      : texture2D( colorMap, vec2(
          0,
          mod(id,nColors)/15.0
        )).rgb;

    float iso = isolineIntensity();
    vec4 isoColor = vec4(0,0,0,1.0-iso);
    vec4 baseColor = bg>254.0
      ? vec4(0)
      : vec4(color*iso*opacity,opacity);
    gl_FragColor = isoColor + baseColor;

}
        `;
    }

  createTexture(nComponents, resolution, array){
    return new THREE.DataTexture(
      array,
      resolution[0],
      resolution[1],
      nComponents===4 ? THREE.RGBAFormat : nComponents===3 ? THREE.RGBFormat : THREE.AlphaFormat,
      nComponents===1 ? THREE.FloatType : THREE.UnsignedByteType,
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      // THREE.LinearFilter,
      // THREE.LinearFilter,
      THREE.NearestFilter,
      THREE.NearestFilter,
      1
    );
  }

  setVtkDataSet(vtkDataSet){

    this.vtkDataSet = vtkDataSet;

    const size = new THREE.Vector2();
    this.renderer.getSize(size);

    // update size if necessary (possible optimization: only create data textures if no swap possible)
    if(size.x!==this.vtkDataSet.dimension[0] || size.y!==this.vtkDataSet.dimension[1]){
      this.renderer.setSize(
        this.vtkDataSet.dimension[0],
        this.vtkDataSet.dimension[1]
      );
    } else {
    }

    this.consts.resolution = [vtkDataSet.dimension[0],vtkDataSet.dimension[1]];

    const uniforms = this.uniforms;
    uniforms.texKDE.value = this.createTexture(1,vtkDataSet.dimension, vtkDataSet.pointData.KDE.data);
    uniforms.texSegmentation.value = this.createTexture(4,vtkDataSet.dimension, vtkDataSet.pointData.MTS.data);

    this.appendCanvas(
      vtkDataSet.origin[0],
      vtkDataSet.origin[1],
      vtkDataSet.origin[0]+vtkDataSet.spacing[0]*vtkDataSet.dimension[0],
      vtkDataSet.origin[1]+vtkDataSet.spacing[1]*vtkDataSet.dimension[1]
    );
  }

  render(idIdx, bgIdx, opacity, nContours, contourWidth){
    this.consts.idIdx = idIdx;
    this.consts.bgIdx = bgIdx;
    this.consts.opacity = opacity;
    this.consts.nContours = nContours;
    this.consts.contourWidth = contourWidth;

    this.quad.material = new THREE.RawShaderMaterial({
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      uniforms: this.uniforms
    });

    this.renderer.render( this.scene, this.camera );
  }

}