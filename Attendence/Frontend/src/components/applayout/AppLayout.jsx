import TopBar from './TopBar';
import SideBar from './SideBar';
import { useState, useRef } from "react";
import './styles.css';

function AppLayout(props) {
    const [sidebarState, setSideBarState] = useState(false);
    const [selectedSidebarItem, setSelectedSidebarItem] = useState("");
    const scrollRef = useRef(null);
  
    const handleSideBar = () => {
      setSideBarState(!sidebarState);
    };
  
    const handleSidebarItemSelect = (itemName) => {
      setSelectedSidebarItem(itemName);
    };
  
    return (
      <div style={{
        backgroundColor: "white",
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        display: 'flex'
      }}>
        <div style={{ height: '100%', display: 'flex' }}>
          <SideBar
            open={sidebarState}
            resource={props.rId}
            onSidebarItemSelect={handleSidebarItemSelect}
            handleSideBar={handleSideBar}
          />
        </div>
        <div style={{ flex: '1', overflow: 'hidden' }} ref={scrollRef}>
          <TopBar sidebar={handleSideBar} scrollElement={scrollRef.current} selectedSidebarItem={selectedSidebarItem} />
          <div className={"app-body"} style={{ width: '100%', height: '100vh' }} >{props.body}</div>
        </div>
      </div>
    );
  }
  export default AppLayout