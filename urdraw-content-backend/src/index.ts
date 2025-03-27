import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import base64url from "base64-url";
import cors from "cors";
import DrawingContent from "./models/drawingContent";
import { verifyToken } from "./utils/tokenUtils";

const app = express();
const port = 3009;

app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hi. urDraw!");
});

app.get("/drawing/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token is required" });
  }

  try {
    const tokenResult = await verifyToken(token);
    if (!tokenResult.active || !tokenResult.payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const drawing = await DrawingContent.findOne({ where: { id } });

    if (drawing) {
      const contentParse = JSON.parse(drawing.dataValues.content);
      contentParse.scene.appState.activeTool.type = "hand";
      contentParse.scene.appState.activeTool.locked = "true";

      const result = {
        ...drawing.dataValues,
        content: JSON.stringify(contentParse),
      };
      res.json(result);
    } else {
      res.status(404).json({ error: "Drawing not found" });
    }
  } catch (error) {
    console.error("Error retrieving drawing:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/drawing", async (req: Request, res: Response) => {
  const { drawId, title } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token is required" });
  }

  if (!drawId) {
    return res.status(400).json({ error: "drawId is required" });
  }

  try {
    const tokenResult = await verifyToken(token);
    if (!tokenResult.active || !tokenResult.payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = tokenResult.payload.sub;

    const existingDrawing = await DrawingContent.findOne({
      where: { id: drawId },
    });
    if (existingDrawing) {
      return res.status(200).json(existingDrawing);
    }

    const newDrawing = await DrawingContent.create({
      id: drawId,
      userId,
      title: title || "Untitled Drawing",
      content:
        '{"scene":{"files":{},"appState":{"name":"Untitled-2025-03-26-1722","zoom":{"value":2.774919642445646},"stats":{"open":false,"panels":3},"theme":"light","toast":null,"penMode":false,"scrollX":-500.4405890227071,"scrollY":-145.1927056075129,"gridSize":null,"openMenu":null,"isLoading":false,"openPopup":null,"snapLines":[],"activeTool":{"type":"selection","locked":false,"customType":null,"lastActiveTool":null},"fileHandle":null,"followedBy":{},"isResizing":false,"isRotating":false,"openDialog":null,"contextMenu":null,"exportScale":1,"openSidebar":null,"pasteDialog":{"data":null,"shown":false},"penDetected":false,"cursorButton":"up","editingFrame":null,"errorMessage":null,"multiElement":null,"userToFollow":null,"editingElement":null,"editingGroupId":null,"frameRendering":{"clip":true,"name":true,"enabled":true,"outline":true},"zenModeEnabled":false,"draggingElement":null,"resizingElement":null,"scrolledOutside":false,"viewModeEnabled":false,"activeEmbeddable":null,"currentChartType":"bar","exportBackground":true,"exportEmbedScene":false,"frameToHighlight":null,"isBindingEnabled":true,"originSnapOffset":{"x":0,"y":0},"selectedGroupIds":{},"selectionElement":null,"showWelcomeScreen":true,"startBoundElement":null,"suggestedBindings":[],"currentItemOpacity":100,"exportWithDarkMode":false,"selectedElementIds":{},"showHyperlinkPopup":false,"currentItemFontSize":20,"elementsToHighlight":null,"lastPointerDownWith":"mouse","viewBackgroundColor":"#ffffff","currentItemFillStyle":"solid","currentItemRoughness":1,"currentItemRoundness":"round","currentItemTextAlign":"left","editingLinearElement":null,"currentItemFontFamily":1,"pendingImageElementId":null,"selectedLinearElement":null,"shouldCacheIgnoreZoom":false,"currentItemStrokeColor":"#1e1e1e","currentItemStrokeStyle":"solid","currentItemStrokeWidth":2,"objectsSnapModeEnabled":false,"currentItemEndArrowhead":"arrow","currentItemStartArrowhead":null,"currentItemBackgroundColor":"transparent","previousSelectedElementIds":{"KTTVz1xxEt_1e5SCOeQdC":true},"defaultSidebarDockedPreference":false,"selectedElementsAreBeingDragged":false},"elements":[["ellipse",329,1282273580,"a2",false,"KTTVz1xxEt_1e5SCOeQdC","solid",2,"solid",1,100,0,765.4669575903592,240.5877474475938,"#1e1e1e","transparent",132.37856412357036,135.40659842874507,761599532,[],null,{"type":2},[{"id":"cWjkWbDKUSHWIffUBitUW","type":"text"}],1742993572378,null,false,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],["text",437,772831179,"a3",false,"cWjkWbDKUSHWIffUBitUW","solid",2,"solid",1,100,0,795.5533693008128,295.9175846787817,"#1e1e1e","transparent",72.59996032714844,25,167428396,[],null,null,[],1742993601732,null,false,null,null,null,null,null,null,20,1,"UrDraw","center","middle","KTTVz1xxEt_1e5SCOeQdC","UrDraw",true,1.25,null,null,null]]},"isExternalScene":false}',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json(newDrawing);
  } catch (error) {
    console.error("Error creating drawing:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/drawing/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const { content } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token is required" });
  }

  try {
    const tokenResult = await verifyToken(token);
    if (!tokenResult.active || !tokenResult.payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = tokenResult.payload.sub;

    const drawing = await DrawingContent.findOne({ where: { id } });

    if (!drawing) {
      const newDrawing = await DrawingContent.create({
        id,
        userId,
        title: "Untitled Drawing",
        content: content || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return res.status(201).json(newDrawing);
    }

    if (content !== undefined || content !== null)
      drawing.set("content", content);
    drawing.set("updatedAt", new Date());

    await drawing.save();

    res.json(drawing);
  } catch (error) {
    console.error("Error updating drawing:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
