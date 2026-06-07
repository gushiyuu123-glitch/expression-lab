import { BrowserRouter, Routes, Route } from "react-router-dom";
import EntranceHall from "./EntranceHall";
import ArtDoorRoom from "./rooms/ArtDoorRoom";
import ScrollDepthRoom from "./rooms/ScrollDepthRoom";
import TypographyRoom from "./rooms/TypographyRoom";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntranceHall />} />
        <Route path="/rooms/art-door" element={<ArtDoorRoom />} />
        <Route path="/rooms/scroll-depth" element={<ScrollDepthRoom />} />
        <Route path="/rooms/typography" element={<TypographyRoom />} />
      </Routes>
    </BrowserRouter>
  );
}