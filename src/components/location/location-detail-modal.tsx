import { useState } from "react"
import { Globe, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import EditLocationModal from "@/components/location/edit-location-modal"
import OverviewTab from "@/components/location/tabs/overview-tab"
import ProductsTab from "@/components/location/tabs/products-tab"
import OrdersTab from "@/components/location/tabs/orders-tab"
import ActivityTab from "@/components/location/tabs/activity-tab"
import { useUpdateLocation } from "@/store/mutations/locations"
import { showAlert } from "@/store/alerts"
import type { Location } from "@/types/locations"

interface Props {
  isOpen: boolean
  onClose: () => void
  location: Location | null
}

export default function LocationDetailModal({ isOpen, onClose, location }: Props) {
  const [activeTab, setActiveTab] = useState("Overview")
  const [showEdit, setShowEdit] = useState(false)
  const [showDeactivate, setShowDeactivate] = useState(false)

  const updateLocation = useUpdateLocation()

  if (!location) return null

  const city = location.address.split(",").slice(-2, -1)[0]?.trim() ?? "Lagos"
  const tabs = ["Overview", "Products", "Orders", "Activity"]

  const handleDeactivate = () => {
    updateLocation.mutate(
      {
        id: location.id,
        name: location.name,
        address: location.address,
        city: "",
        state: "",
        phone: location.contact,
        supportsPickup: location.pickupEnabled,
        supportsWalkin: location.walkInEnabled,
        isActive: false,
      },
      {
        onSuccess: () => {
          showAlert({ variant: "success", message: "Location deactivated" })
          setShowDeactivate(false)
        },
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const customHeader = (
    <div className="border-borderSubtle border-b px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-jakarta text-brand text-base font-semibold">{location.name}</h2>
            {location.alwaysFufill && (
              <span className="font-jakarta bg-secondary/10 text-secondary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                <Globe size={11} />
                Handles Website orders
              </span>
            )}
          </div>
          <p className="font-jakarta text-brand/50 mt-0.5 text-sm">
            {location.storeId} · Physical · {city}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-brand/40 hover:text-brand rounded p-1 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle flex items-center justify-between border-t px-6 py-4">
      <div />
      <div className="flex flex-1 gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setShowDeactivate(true)}
          disabled={updateLocation.isPending}
        >
          Deactivate location
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowEdit(true)}
          disabled={updateLocation.isPending}
          className="flex-1"
        >
          Edit location details
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        variant="drawer"
        customHeader={customHeader}
        customFooter={customFooter}
        width="652px"
        preventClose={updateLocation.isPending}
      >
        {/* Tab nav */}
        <div className="border-borderSubtle flex border-b px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "font-jakarta -mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "text-brand/50 hover:text-brand border-transparent",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-6 py-5">
          {activeTab === "Overview" && <OverviewTab location={location} />}
          {activeTab === "Products" && <ProductsTab locationId={location.id} />}
          {activeTab === "Orders" && <OrdersTab locationId={location.id} />}
          {activeTab === "Activity" && <ActivityTab locationId={location.id} />}
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={showDeactivate}
        onClose={() => setShowDeactivate(false)}
        onConfirm={handleDeactivate}
        isLoading={updateLocation.isPending}
        variant="deactivate"
        entityType="location"
        entityName={location.name}
      />
      <EditLocationModal isOpen={showEdit} onClose={() => setShowEdit(false)} location={location} />
    </>
  )
}
