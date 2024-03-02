// ModelSidebar.js
function ModelSidebar({ onSelectModel }) {
  const models = [
    { name: 'Chair', path: '/models/sofa_chair.glb' },
    { name: 'Table', path: '/models/holo-table.glb' },
    // Add more models here
  ];

  return (
    <div className="model-sidebar">
      {models.map((model) => (
        <div key={model.path} // Use model.path as a key
             draggable="true"
             onDragStart={(e) => e.dataTransfer.setData("modelPath", model.path)}
             className="draggable-model">
          {model.name}
        </div>
      ))}
    </div>
  );
}
export default ModelSidebar;
