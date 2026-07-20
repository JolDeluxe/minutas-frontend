import { Button } from '@/components/ui/button';
import { Fab } from '@/components/ui/fab';

export const UserAddButton = ({ onClick, isMobile = false }) => {

    // 📱 VISTA MÓVIL: FAB con efecto Liquid Glass Verde
    if (isMobile) {
        return (
            <Fab
                icon="add"
                onClick={onClick}
                variant="glass-blue"
                positionClass="bottom-24 right-5"
            />
        );
    }

    // 💻 VISTA ESCRITORIO: Botón verde sólido normal
    return (
        <div className="flex justify-end w-full px-2 lg:px-0">
            <Button
                variant="accion" // ← Verde corporativo
                icon="add"
                onClick={onClick}
            >
                Agregar nuevo usuario
            </Button>
        </div>
    );
};