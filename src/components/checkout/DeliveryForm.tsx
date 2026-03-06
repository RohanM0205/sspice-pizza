interface Props {
    form: any;
    setForm: any;
    savedAddresses: any[];
    selectedAddressId: string | null;
    setSelectedAddressId: (id: string) => void;
  }
  
  const DeliveryForm = ({
    form,
    setForm,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
  }: Props) => {
    return (
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold">Delivery Details</h3>
  
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="w-full px-4 py-3 border rounded-lg bg-secondary"
        />
  
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          className="w-full px-4 py-3 border rounded-lg bg-secondary"
        />
  
        {savedAddresses.length > 0 && (
          <div>
            <p className="font-medium mb-2">Saved Addresses</p>
  
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`p-3 border rounded-lg mb-2 cursor-pointer ${
                  selectedAddressId === addr.id
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {addr.address_line}, {addr.city}
              </div>
            ))}
          </div>
        )}
  
        {!selectedAddressId && (
          <textarea
            placeholder="Full Address"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-lg bg-secondary"
          />
        )}
      </div>
    );
  };
  
  export default DeliveryForm;