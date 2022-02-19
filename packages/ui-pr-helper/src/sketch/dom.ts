import { getDocuments, getSelectedDocument, Page, Types, Image, Rectangle } from 'sketch/dom';
import { ImageLayerFrame } from '../types/dom';

export function getArtBoardFrame(selectedPage: Page | undefined, imgScale: number): ImageLayerFrame {
  // 初始图片大小（依据iphone6尺寸）
  const originalImgFrame = {
    x: __INITIAL_POINT_X__,
    y: __INITIAL_POINT_Y__,
    width: __IPHONE6_WIDTH__,
    height: __IPHONE6_WIDTH__ / imgScale
  }

  // 首个画板的架构
  let firstLayerFrame
  // 已选择的画板架构
  let selectedLayerFrame

  if (!selectedPage) {
    return originalImgFrame
  }

  // 找出首个图片的位置，然后获取尺寸
  for (let index = 0; index < selectedPage.layers.length; index++) {
    const layer = selectedPage.layers[index];
    if (layer.type !== Types.Image && layer.type !== Types.Artboard) continue

    // 如果没有首个画板架构，则填充
    if (!firstLayerFrame) {
      firstLayerFrame = layer.frame
    }

    // 如果没有已选择的画板架构，则填充
    if (!selectedLayerFrame && layer.selected) {
      selectedLayerFrame = layer.frame
    }

    // 如果都有数据，直接跳出
    if (firstLayerFrame && selectedLayerFrame) {
      break
    }
  }

  // 优先已选择的画板
  if (selectedLayerFrame) {
    return Object.assign(originalImgFrame, selectedLayerFrame, {
      height: selectedLayerFrame.width / imgScale
    })
  } else if (firstLayerFrame) { // 其次是首个画板
    return Object.assign(originalImgFrame, firstLayerFrame, {
      height: firstLayerFrame.width / imgScale
    })
  }

  // 如果没有直接输入原始框架
  return originalImgFrame
}

export function getSelectedPage(): Page {
  // 已选择的页面
  let selectedDoc = getSelectedDocument()
  if (!selectedDoc) {
    selectedDoc = getDocuments()[0]
  }

  return selectedDoc.selectedPage
}

export function initImageLayer(option: { imageUrl: string, imgScale: number, selectedPage: Page | undefined }): Image {
  const { imageUrl, selectedPage, imgScale } = option
  // 创建图片base64
  let imageData = NSData.alloc().initWithBase64Encoding(imageUrl)
  let image = NSImage.alloc().initWithData(imageData)

  // 获取画板的尺寸
  const layerFrame = getArtBoardFrame(selectedPage, imgScale)
  const imageLayer = new Image({
    image,
    frame: new Rectangle(layerFrame.x, layerFrame.y, layerFrame.width, layerFrame.height),
  })

  return imageLayer
}