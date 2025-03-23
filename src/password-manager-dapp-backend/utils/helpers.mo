import Types "../types";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Char "mo:base/Char";

func key(t: Text) : Types.Key<Text> { { hash = Text.hash t; key = t } };

func is_authenticated(caller: Principal) : Bool {
  return Principal.isAnonymous(caller) == false;
};

func validate_username(username: Text): Bool {
  if (Text.size(username) == 0 or Text.size(username) > 10) {
    return false;
  };

  var isValid = true;
  Iter.iterate<Char>(username.chars(), func(c, _) {
    if (not (Char.isAlphabetic(c) or Char.isDigit(c))) {
      isValid := false;
    };
  });

  return isValid;
}