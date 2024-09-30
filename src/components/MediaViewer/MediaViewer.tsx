'use client';

import {  useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Blend, ChevronLeft, ChevronDown, Crop, Info, Pencil, Trash2, Wand2, Image, Ban, PencilRuler, ScissorsSquare, Square, RectangleHorizontal,
    RectangleVertical, Loader2 } from 'lucide-react';
import { CldImageProps, getCldImageUrl } from 'next-cloudinary';
import { useQueryClient } from '@tanstack/react-query';

import Container from '@/components/Container';
import CldImage from '../CldImage';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { addCommas, formatBytes } from '@/lib/utils';
import { CloudinaryResource } from '@/app/types';

interface Deletion {
  state: string;
}

const MediaViewer = ({ resource }: { resource: CloudinaryResource }) => {
  const queryClient = useQueryClient()

  const sheetFiltersRef = useRef<HTMLDivElement | null>(null);
  const sheetInfoRef = useRef<HTMLDivElement | null>(null);

  // Sheet / Dialog UI state, basically controlling keeping them open or closed

  const [ filterSheetIsOpen, setFilterSheetIsOpen ] = useState(false);
  const [ infoSheetIsOpen, setInfoSheetIsOpen ] = useState(false);
  const [ deletion, setDeletion ] = useState<Deletion>();

  const [ version, setVersion ] = useState(1)
  const [ enhancements, setEnhancements ] = useState("None")
  const [ crop, setCrop ] = useState("Original")
  const [ filterIdx, setFilterIdx ] = useState(0)    

  /**
   * closeMenus
   * @description Closes all panel menus and dialogs
   */

  function closeMenus() {
    setFilterSheetIsOpen(false)
    setInfoSheetIsOpen(false)
    setDeletion(undefined)
  }

  const resetChanges = () => {
    setEnhancements("None")
    setCrop("Original")
    setFilterIdx(0)
  }

  /**
   * handleOnDeletionOpenChange
   */

  function handleOnDeletionOpenChange(isOpen: boolean) {
    // Reset deletion dialog if the user is closing it
    if ( !isOpen ) {
      setDeletion(undefined);
    }
  }

  // Listen for clicks outside of the panel area and if determined
  // to be outside, close the panel. This is marked by using
  // a data attribute to provide an easy way to reference it on
  // multiple elements

  useEffect(() => {
    document.body.addEventListener('click', handleOnOutsideClick)
    return () => {
      document.body.removeEventListener('click', handleOnOutsideClick)
    }
  }, []);

  function handleOnOutsideClick(event: MouseEvent) {
    const excludedElements = Array.from(document.querySelectorAll('[data-exclude-close-on-click="true"]'));
    const clickedExcludedElement = excludedElements.filter(element => event.composedPath().includes(element)).length > 0;

    if ( !clickedExcludedElement ) {
      closeMenus();
    }
  }  

  const enhancementButtons = [
    { label: "None", icon: <Ban className="w-5 h-5 mr-3" /> }, 
    { label: "Improve", icon: <Wand2 className="w-5 h-5 mr-3" /> }, 
    { label: "Restore", icon: <PencilRuler className="w-5 h-5 mr-3" /> }, 
    { label: "Remove Background", icon: <ScissorsSquare className="w-5 h-5 mr-3" />}
  ]

  const cropAndResizes = [
    { label: "Original", icon: <Image className="w-5 h-5 mr-3" /> }, 
    { label: "Square", icon: <Square className="w-5 h-5 mr-3" /> }, 
    { label: "Landscape", icon: <RectangleHorizontal className="w-5 h-5 mr-3" /> }, 
    { label: "Portrait", icon: <RectangleVertical className="w-5 h-5 mr-3" />}
  ]

  const filters = [
    {
       type:"No Filter", filter:{},
    },
    {
      type:"Sepia", filter:{ sepia: true },
    },
    {
      type:"Sizzle Art", filter:{ art: 'sizzle' },
    },
    {
      type:"Grayscale", filter:{ grayscale: true },
    }
  ]

  const info = [
    { label: "ID", content: resource.public_id},
    {
      label: "Date Created", content: new Date(resource.created_at).toLocaleString()
    },
    {
      label: "Width", content: addCommas(resource.width)
    },
    {
      label: "Height", content: addCommas(resource.height)
    },
    {
      label: "Format", content: resource.format
    },
    {
      label: "Size", content: formatBytes(resource.bytes)
    },
    {
      label: "Tags", content: resource.tags.join(", ")
    }
  ]

  type Transformation = Omit<CldImageProps, "src" | "alt">
  const transformations:Transformation = { ...filters[filterIdx].filter }

  switch(enhancements){
    case 'restore':
      transformations.restore = true
      break
    case 'improve':
      transformations.improve = true
      break
    case 'Remove Background':
      transformations.removeBackground = true
      break
  }

  switch(crop){
    case 'Square':
      if(resource.width > resource.height){
        transformations.height = resource.width
      } else {
        transformations.width = resource.height
      }
      
      break;
    case 'Landscape':
      transformations.height = Math.floor(resource.width / (16/9))
      break;
    case 'Portrait':
      transformations.width = Math.floor(resource.height / (16/9))
      break;
  }

  if(crop !== 'Original'){
    transformations.crop = { source: true, type: 'fill' }
  }

  const imageTransformed = Object.entries(transformations).length > 0

  const router = useRouter()
  
  const getImageUrl = () => {
    const url = getCldImageUrl({
      width: resource.width,
      height: resource.height,
      src: resource.public_id,       
      format: 'default',
      quality: 'default', 
      ...transformations        
    })

    return url
  }

  const handleOnSave = async () => {
    const url = getImageUrl()

    await fetch(url)

    const result = await fetch(`/api/upload`, {
      method: 'POST',
      body: JSON.stringify({ publicId: resource.public_id, url })
    })
    .then(res => {
      return res.json()
    })
    
    closeMenus()
    resetChanges()
    setVersion(Date.now())
  }

  const handleOnSaveCopy = async () => {  
    const url = getImageUrl()

    await fetch(url)

    const { data } = await fetch(`/api/upload`, {
      method: 'POST',
      body: JSON.stringify({ url })
    })
    .then(res => {
      return res.json()
    })

    invalidateQueries()

    router.push(`/resources/${data.asset_id}`)
    
  }

  const handleDelete = async () => {
    setDeletion({ state: 'deleting' })
    const result = await fetch(`/api/delete`, {
      method: 'DELETE',
      body: JSON.stringify({ publicId: resource.public_id })
    })

    invalidateQueries()

    router.push("/")
  }

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ['resources', String(process.env.NEXT_PUBLIC_CLOUDINARY_LIBRARY_TAG)]
    })
  }

  // Canvas sizing based on the image dimensions. The tricky thing about
  // showing a single image in a space like this in a responsive way is trying
  // to take up as much room as possible without distorting it or upscaling
  // the image. Since we have the resource width and height, we can dynamically
  // determine whether it's landscape, portrait, or square, and change a little
  // CSS to make it appear centered and scalable!

  const canvasHeight = transformations.height || resource.height;
  const canvasWidth = transformations.width || resource.width;

  const isSquare = canvasHeight === canvasWidth;
  const isLandscape = canvasWidth > canvasHeight;
  const isPortrait = canvasHeight > canvasWidth;

  const imgStyles: Record<string, string | number> = {};

  if ( isLandscape ) {
    imgStyles.maxWidth = resource.width;
    imgStyles.width = '100%';
    imgStyles.height = 'auto';
  } else if ( isPortrait || isSquare ) {
    imgStyles.maxHeight = resource.height;
    imgStyles.height = '100vh';
    imgStyles.width = 'auto'
  }

  return (
    <div className="h-screen bg-black px-0">

      {/** Modal for deletion */}

      <Dialog open={!!deletion?.state && ['confirm', 'deleting'].includes(deletion?.state)} onOpenChange={handleOnDeletionOpenChange}>
        <DialogContent data-exclude-close-on-click={true}>
          <DialogHeader>
            <DialogTitle className="text-center">Are you sure you want to delete?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="justify-center sm:justify-center">
            <Button variant="destructive" onClick={handleDelete} disabled={deletion?.state === 'deleting'}>
              {
                deletion?.state === 'deleting'?
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />:
                    <Trash2 className="h-4 w-4 mr-2" />
              }
               Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/** Edit panel for transformations and filters */}

      <Sheet modal={false} open={filterSheetIsOpen}>
        <SheetContent
          ref={sheetFiltersRef}
          className="w-full sm:w-3/4 grid grid-rows-[1fr_auto] bg-zinc-800 text-white border-0"
          data-exclude-close-on-click={true}
        >
          <Tabs defaultValue="account">
            <TabsList className="grid grid-cols-3 w-full bg-transparent p-0">
              <TabsTrigger value="enhance">
                <Wand2 />
                <span className="sr-only">Enhance</span>
              </TabsTrigger>
              <TabsTrigger value="crop">
                <Crop />
                <span className="sr-only">Crop & Resize</span>
              </TabsTrigger>
              <TabsTrigger value="filters">
                <Blend />
                <span className="sr-only">Filters</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="enhance">
              <SheetHeader className="my-4">
                <SheetTitle className="text-zinc-400 text-sm font-semibold">Enhancements</SheetTitle>
              </SheetHeader>
              <ul className="grid gap-2">
                {
                  enhancementButtons.map(d => {
                    return (
                      <li key={d.label}>
                        <Button variant="ghost" className={`text-left justify-start w-full h-14 border-4 bg-zinc-700 ${enhancements === d.label?"border-white":"border-transparent"}`}
                          onClick={()=>{setEnhancements(d.label)}}
                        >
                          { d.icon }
                          <span className="text-[1.01rem]">{d.label}</span>
                        </Button>
                      </li>
                    )
                  })
                }
              </ul>
            </TabsContent>
            <TabsContent value="crop">
              <SheetHeader className="my-4">
                <SheetTitle className="text-zinc-400 text-sm font-semibold">Cropping & Resizing</SheetTitle>
              </SheetHeader>
              <ul className="grid gap-2">
                {
                  cropAndResizes.map(d => {
                    return (
                      <li key={d.label}>
                        <Button 
                          variant="ghost" 
                          className={`text-left justify-start w-full h-14 border-4 bg-zinc-700 ${crop === d.label?"border-white":"border-transparent"}`}
                          onClick={()=>{setCrop(d.label)}}
                        >
                          {d.icon}
                          <span className="text-[1.01rem]">{ d.label }</span>
                        </Button>
                      </li>
                    )
                  })
                }
              </ul>
            </TabsContent>
            <TabsContent value="filters">
              <SheetHeader className="my-4">
                <SheetTitle className="text-zinc-400 text-sm font-semibold">Filters</SheetTitle>
              </SheetHeader>
              <ul className="grid grid-cols-2 gap-2">
                {
                  filters.map((d, i) => {
                    const isActive = filterIdx === i
                    return (
                      <li key={d.type}>
                        <button className={`w-full border-4 ${isActive?'border-white':'border-transparent'}`}
                          onClick={()=>{setFilterIdx(i)}}
                        >
                          <CldImage
                            width={156}
                            height={156}
                            crop='fill'
                            src={ resource.public_id }
                            alt={d.type}
                            {...d.filter}
                          />
                        </button>
                      </li>
                    )
                  })
                }                
              </ul>
            </TabsContent>
          </Tabs>
          <SheetFooter className="gap-2 sm:flex-col">
            {
              imageTransformed && 
              <div className="grid grid-cols-[1fr_4rem] gap-2">
                <Button
                  variant="ghost"
                  className="w-full h-14 text-left justify-center items-center bg-blue-500"
                  onClick={handleOnSave}
                >
                  <span className="text-[1.01rem]">
                    Save
                  </span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full h-14 text-left justify-center items-center bg-blue-500"                      
                    >
                      <span className="sr-only">More Options</span>
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" data-exclude-close-on-click={true}>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={handleOnSaveCopy}
                      >
                        <span>Save as Copy</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
            <Button
              variant="outline"
              className={`w-full h-14 text-left justify-center items-center bg-transparent ${imageTransformed?"bg-red-500":"border-zinc-600"}`}
              onClick={() => {
                closeMenus()
                resetChanges()
              }}
            >
              <span className="text-[1.01rem]">
                { imageTransformed?"Cancel":"Close" }
              </span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/** Info panel for asset metadata */}

      <Sheet modal={false} open={infoSheetIsOpen}>
        <SheetContent
          ref={sheetInfoRef}
          className="w-full sm:w-3/4 grid grid-rows-[auto_1fr_auto] bg-zinc-800 text-white border-0"
          data-exclude-close-on-click={true}
        >
          <SheetHeader className="my-4">
            <SheetTitle className="text-zinc-200 font-semibold">Info</SheetTitle>
          </SheetHeader>
          <div>
            <ul>
              {
                info.map(d => {
                  return (
                    <li className="mb-3" key={d.label}>
                    <strong className="block text-xs font-normal text-zinc-400 mb-1">{d.label}</strong>
                    <span className="flex gap-4 items-center text-zinc-100">
                      { d.content }
                    </span>
                  </li>
                  )
                })
              }
            </ul>
          </div>
          <SheetFooter>
            <Button
              variant="outline"
              className="w-full h-14 text-left justify-center items-center bg-transparent border-zinc-600"
              onClick={() => closeMenus()}
            >
              <span className="text-[1.01rem]">Close</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/** Asset management navbar */}

      <Container className="fixed z-10 top-0 left-0 w-full h-16 flex items-center justify-between gap-4 bg-gradient-to-b from-black">
        <div className="flex items-center gap-4">
          <ul>
            <li>
              <Link href="/" className={`${buttonVariants({ variant: "ghost" })} text-white`}>
                <ChevronLeft className="h-6 w-6" />
                Back
              </Link>
            </li>
          </ul>
        </div>
        <ul className="flex items-center gap-4">
          <li>
            <Button variant="ghost" className="text-white" onClick={() => setFilterSheetIsOpen(true)}>
              <Pencil className="h-6 w-6" />
              <span className="sr-only">Edit</span>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="text-white" onClick={() => setInfoSheetIsOpen(true)}>
              <Info className="h-6 w-6" />
              <span className="sr-only">Info</span>
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="text-white" onClick={() => setDeletion({ state: 'confirm' })}>
              <Trash2 className="h-6 w-6" />
              <span className="sr-only">Delete</span>
            </Button>
          </li>
        </ul>
      </Container>

      {/** Asset viewer */}

      <div className="relative flex justify-center items-center align-center w-full h-full">
        <CldImage
          key={`${JSON.stringify(transformations)} - ${version}`}
          className="object-contain"
          width={resource.width}
          height={resource.height}
          src={resource.public_id}
          version={version}
          alt=""
          style={imgStyles}
          {...transformations}
        />
      </div>
    </div>
  )
};

export default MediaViewer;