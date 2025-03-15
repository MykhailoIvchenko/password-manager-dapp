import Types "types";
import Text "mo:base/Text";
import Principal "mo:base/Principal";

func key(t: Text) : Types.Key<Text> { { hash = Text.hash t; key = t } };

func is_authenticated(caller: Principal) : Bool {
  return Principal.isAnonymous(caller) == false;
};
