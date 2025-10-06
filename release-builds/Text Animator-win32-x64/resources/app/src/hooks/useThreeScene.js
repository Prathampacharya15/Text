import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export function useThreeScene() {
  const mountRef = useRef();
  const canvasRef = useRef();
  const textureRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    // Canvas for text
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    canvasRef.current = ctx;

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    textureRef.current = texture;

    // Plane geometry
    const geometry = new THREE.PlaneGeometry(canvas.width / 100, canvas.height / 100);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({color:0xff0000}));
    cube.position.set(0, 0, 0);

const gridHelper = new THREE.GridHelper(500, 1000, 0x00ffcc, 0x333333);
gridHelper.rotation.x = Math.PI / 2
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({color:0x00ff00}));
sphere.position.set(-2, 0, 0);

    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = 5
    scene.add(plane);
    scene.add(sphere);
    scene.add(cube)
    scene.add(gridHelper);

    // Render loop
    const animate = () => {
      controls.update();
    
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount && renderer.domElement) mount.removeChild(renderer.domElement);
    };
  }, []);

  return { mountRef, canvasRef, textureRef };
}
