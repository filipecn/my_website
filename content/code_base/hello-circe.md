hello circe
---
```cpp
#include <circe/circe.h>

struct alignas(16) vec3_16 {
  vec3_16() = default;
  vec3_16(float x, float y, float z) : x(x), y(y), z(z) {}
  vec3_16 &operator=(const circe::Color &color) {
    x = color.r;
    y = color.g;
    z = color.b;
    return *this;
  }
  float x{0};
  float y{0};
  float z{0};
};

class HelloCirce : public circe::gl::BaseApp {
public:
  struct alignas(16) PBR_UB {
    vec3_16 albedo;
    float metallic{};
    float roughness{};
    float ao{};
  } pbr_ubo_data;

  HelloCirce() : BaseApp(800, 800) {
    /// setup mesh ////////////////////////////////////////////////////////////
    // mesh = circe::gl::SceneModel::fromFile("teapot.obj", 
    //                                           circe::shape_options::normal);
    mesh = circe::Shapes::icosphere(8, circe::shape_options::normal);
    
    /// compile shader ////////////////////////////////////////////////////////
    if (!mesh.program.link("directory", "pbr"))
      std::cerr << "Failed to load model shader: " + mesh.program.err << "\n";

    /// setup UBO /////////////////////////////////////////////////////////////
    scene_ubo.push(mesh.program);
    mesh.program.setUniformBlockBinding("PBR", 0);

    pbr_ubo_data.albedo = vec3_16(.5f, 0.f, 0.f);
    pbr_ubo_data.ao = 1;
    pbr_ubo_data.metallic = 0.45;
    pbr_ubo_data.roughness = 0.35;
    scene_ubo["PBR"] = &pbr_ubo_data;
    /// setup SSBO ////////////////////////////////////////////////////////////
    ponos::AoS aos;
    aos.pushField<vec3_16>("position");
    aos.pushField<vec3_16>("color");
    aos.resize(4);
    // positions
    aos.valueAt<vec3_16>(0, 0) = vec3_16(10, 10, 10);
    aos.valueAt<vec3_16>(0, 1) = vec3_16(-10, -10, 10);
    aos.valueAt<vec3_16>(0, 2) = vec3_16(-10, 10, 10);
    aos.valueAt<vec3_16>(0, 3) = vec3_16(10, -10, 10);
    // colors
    aos.valueAt<vec3_16>(1, 0) = vec3_16(300, 300, 300);
    aos.valueAt<vec3_16>(1, 1) = vec3_16(300, 300, 300);
    aos.valueAt<vec3_16>(1, 2) = vec3_16(300, 300, 300);
    aos.valueAt<vec3_16>(1, 3) = vec3_16(300, 300, 300);
    scene_ssbo = aos;
    scene_ssbo.setBindingIndex(1);

  }

  void render(circe::CameraInterface *camera) override {
    // render model
    mesh.program.use();
    mesh.program.setUniform("view",
        ponos::transpose(camera->getViewTransform().matrix()));
    mesh.program.setUniform("model", ponos::transpose(mesh.transform.matrix()));
    mesh.program.setUniform("projection",
        ponos::transpose(camera->getProjectionTransform().matrix()));
    mesh.program.setUniform("camPos", camera->getPosition());
    scene_ssbo.bind();
    mesh.draw();
  }
  // scene
  circe::gl::SceneModel mesh;
  circe::gl::UniformBuffer scene_ubo;
  circe::gl::ShaderStorageBuffer scene_ssbo;

};

int main() {
  return HelloCirce().run();
}
```